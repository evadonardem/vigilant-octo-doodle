<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderStoreItem;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Log;

class PurchaseOrderStoreItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, PurchaseOrder $purchaseOrder, Store $store)
    {
        if (!$purchaseOrder->stores->contains($store)) {
            abort(422, 'Store not belong to PO.');
        }

        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $items = $purchaseOrder->items()
            ->orderBy('name', 'asc')
            ->where('store_id', '=', $store->id)
            ->paginate($perPage);

        $items->each(function ($item) use ($store, $purchaseOrder) {
            $item->effective_price = $this->getStoreEffectiveItemPrice($store->id, $item->id, $purchaseOrder->to);
            $item->purchase_order_status = $purchaseOrder->status;
        });

        return response()->json($items);
    }

    public function indexStoreRequests(Request $request, PurchaseOrder $purchaseOrder, Store $store)
    {
        $storeItems = Item::orderBy('name', 'asc')
            ->whereHas('stores', function ($query) use ($store) {
                $query->where('stores.id', $store->id);
            })
            ->get();

        $purchaseOrderStoreItems = $purchaseOrder->items()
            ->orderBy('name', 'asc')
            ->wherePivot('purchase_order_id', '=', $purchaseOrder->id)
            ->wherePivot('store_id', '=', $store->id)
            ->get();
        
        $items = $storeItems->merge($purchaseOrderStoreItems)->unique();

        return response()->json(['data' => $items]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\PurchaseOrderStoreItem  $purchaseOrderStoreItem
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder, Store $store, Item $item)
    {
        $attributes = $request->except('token');

        if (
            $purchaseOrder->status()->where('code', '=', 'approved')->count() > 0 &&
            array_key_exists('quantity_original', $attributes)
        ) {
            abort(422, 'Cannot update original quantity for purchase order under ' . $purchaseOrder->status->name . ' status.');
        }

        if ($purchaseOrder->status()->where('code', '=', 'closed')->count() > 0) {
            abort(422, 'Cannot update details for purchase order under ' . $purchaseOrder->status->name . ' status.');
        }

        $item = $purchaseOrder
            ->items()
            ->where([
                'purchase_order_id' => $purchaseOrder->id,
                'store_id' => $store->id,
                'item_id' => $item->id,
            ])
            ->first();

        $purchaseOrderItem = PurchaseOrderStoreItem::findOrFail($item->pivot->id);
        $purchaseOrderItem
            ->fill($attributes)
            ->save();

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PurchaseOrderStoreItem  $purchaseOrderStoreItem
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, PurchaseOrder $purchaseOrder, Store $store, Item $item)
    {
        if ($purchaseOrder->status()->whereIn('code', ['approved', 'closed'])->count() > 0) {
            abort(422, 'Cannot delete item for purchase order under ' . $purchaseOrder->status->name . ' status.');
        }

        $purchaseOrder
            ->items()
            ->where([
                'store_id' => $store->id,
                'item_id' => $item->id,
            ])
            ->first()
            ->pivot
            ->delete();

        return response()->json([
            'refresh_purchase_order_stores' => $purchaseOrder
                ->items()
                ->where([
                    'store_id' => $store->id,
                ])
                ->get()
                ->count() == 0
        ]);
    }

    private function getStoreEffectiveItemPrice(int $storeId, int $itemId, string $date)
    {
        $store = Store::findOrFail($storeId);
        $itemEffectivePrice = $store->items()
            ->orderBy('store_item_prices.effectivity_date', 'desc')
            ->where('store_item_prices.item_id', '=', $itemId)
            ->where('store_item_prices.effectivity_date', '<=', $date)
            ->first();
        return $itemEffectivePrice ? $itemEffectivePrice->pivot->amount : 0;
    }
}

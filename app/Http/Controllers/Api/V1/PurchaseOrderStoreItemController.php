<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderStoreItem;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

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

        return response()->json($items);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, PurchaseOrder $purchaseOrder, Item $item)
    {

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

        $item = $purchaseOrder
            ->items()
            ->where([
                'store_id' => $store->id,
                'item_id' => $item->id,
            ])
            ->first();

        $item->pivot->fill($attributes);
        $item->pivot->save();

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
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\SalesInvoice;
use App\Models\StockCard;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class StockCardController extends Controller
{
    use Helpers;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if ($request->user()->cannot('View stock card')) {
            abort(403);
        }

        $stockCardsQuery = StockCard::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->orderBy('id', 'desc')
            ->with('store');

        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $stockCards = $stockCardsQuery->paginate($perPage);

        return response()->json($stockCards);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if ($request->user()->cannot('Create stock card')) {
            abort(403);
        }

        $attributes = $request->only(['store_id', 'from', 'to']);

        $stockCard = StockCard::create($attributes);
        $itemIds = $stockCard->store->items->pluck('id')->unique();
        $itemIds->each(function ($itemId) use ($stockCard) {
            $storeId = $stockCard->store_id;
            $inventoryTypes = [
                'disers_inventory',
                'sra_inventory',
                'beginning_inventory',
                'delivered_inventory',
                'sold_inventory',
            ];
            foreach ($inventoryTypes as $type) {
                $coveredPurchaseOrders = PurchaseOrder::whereDate('from', '<=', $stockCard->from)
                    ->whereHas('status', function ($query) {
                        $query->where('code', 'closed');
                    })
                    ->whereHas('items', function ($query) use ($itemId, $storeId) {
                        $query
                            ->where('item_id', $itemId)
                            ->where('store_id', $storeId);
                    })
                    ->with('items')
                    ->get();
                $poItems = collect();
                $coveredPurchaseOrders->each(function ($purchaseOrder) use (&$poItems, $itemId, $storeId) {
                    $purchaseOrderItems = $purchaseOrder->items
                        ->where('id', $itemId)
                        ->where('pivot.store_id', $storeId);
                    if ($purchaseOrderItems->count() > 0) {
                        $poItems = $poItems->merge($purchaseOrderItems);
                    }
                });

                $coveredSalesInvoices = SalesInvoice::whereDate('from', '<=', $stockCard->from)
                    ->whereHas('items', function ($query) use ($itemId, $storeId) {
                        $query
                            ->where('item_id', $itemId)
                            ->where('store_id', $storeId);
                    })
                    ->with('items')
                    ->get();
                $salesItems = collect();
                $coveredSalesInvoices->each(function ($salesInvoice) use (&$salesItems, $itemId, $storeId) {
                    $salesInvoiceItems = $salesInvoice->items
                        ->where('item_id', $itemId)
                        ->where('store_id', $storeId);
                    if ($salesInvoiceItems->count() > 0) {
                        $salesItems = $salesItems->merge($salesInvoiceItems);
                    }
                });

                $quantity = 0;
                if ($type === 'sra_inventory') {
                    $quantity = $poItems->sum('pivot.quantity_returns');
                } elseif ($type === 'beginning_inventory') {
                    $nearestPreviousStockCard = StockCard::orderBy('from', 'desc')
                        ->where('id', '!=', $stockCard->id)
                        ->whereDate('from', '<=', $stockCard->from)
                        ->first();
                    if ($nearestPreviousStockCard) {
                        $nearestPreviousStockCardDetails =
                            $this->api->get('stock-cards/' . $nearestPreviousStockCard->id . '/details');
                        $data = $nearestPreviousStockCardDetails['data'];
                        $itemEndingInventory = array_values(array_filter($data, function ($detail) use ($itemId) {
                            return $detail['type'] == 'ending_inventory' && $detail['item_id'] == $itemId;
                        }));
                        $itemEndingInventory = !empty($itemEndingInventory)
                            ? $itemEndingInventory[0]
                            : null;
                        $quantity = $itemEndingInventory ? $itemEndingInventory['quantity'] : 0;
                    }
                } elseif ($type === 'delivered_inventory') {
                    $quantity = $poItems->sum('pivot.quantity_actual');
                } else {
                    if ($type === 'sold_inventory') {
                        $quantity = $salesItems->sum('quantity');
                    }
                }
                $stockCard->details()->create([
                    'type' => $type,
                    'item_id' => $itemId,
                    'quantity' => $quantity,
                ]);
            }
        });
        return $stockCard;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\StockCard  $stockCard
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, StockCard $stockCard)
    {
        if ($request->user()->cannot('View stock card')) {
            abort(403);
        }

        $stockCard->loadMissing('store.items');
        $itemIds = $stockCard->store->items->pluck('id')->unique()->toArray();
        $stockCard->items = $itemIds
            ? Item::whereIn('id', $itemIds)->get()
            : collection();

        return response()->json(['data' => $stockCard]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\StockCard  $stockCard
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, StockCard $stockCard)
    {
        if ($request->user()->cannot('Delete stock card')) {
            abort(403);
        }

        $stockCard->delete();

        return response()->noContent();
    }
}

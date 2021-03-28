<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Log;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $purchaseOrders = PurchaseOrder::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->with('status')
            ->paginate($perPage);

        return response()->json($purchaseOrders);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexPurchaseOrderStores(PurchaseOrder $purchaseOrder)
    {
        $stores = $purchaseOrder
            ->stores()
            ->orderBy('name', 'asc')
            ->orderBy('address_line', 'asc')
            ->get();

        return response()->json(['data' => $stores]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $attributes = $request->only(['location', 'from', 'to']);

        PurchaseOrder::create(array_merge(
            [
                'code' => date('Y') . '-' . time(),
                'purchase_order_status_id' => 1,
            ],
            $attributes
        ));

        return response()->noContent();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storePurchaseOrderItems(Request $request, PurchaseOrder $purchaseOrder)
    {
        $attributes = $request->only(['store_id', 'item_id', 'quantity_original']);

        if ($purchaseOrder->items->contains(function ($val, $key) use ($attributes) {
            return $val->id == $attributes['item_id'] &&
                $val->pivot->store_id == $attributes['store_id'];
        })) {
            return abort(422, 'Store item already added to this purchase order.');
        }

        $purchaseOrder->items()->attach([
            $attributes['item_id'] => [
                'store_id' => $attributes['store_id'],
                'quantity_original' => $attributes['quantity_original']
            ]
        ]);

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PurchaseOrder  $purchaseOrder
     * @return \Illuminate\Http\Response
     */
    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->status;

        return response()->json(['data' => $purchaseOrder]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PurchaseOrder  $purchaseOrder
     * @return \Illuminate\Http\Response
     */
    public function edit(PurchaseOrder $purchaseOrder)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\PurchaseOrder  $purchaseOrder
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PurchaseOrder  $purchaseOrder
     * @return \Illuminate\Http\Response
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status()->whereIn('code', ['approved', 'closed'])->count() > 0) {
            abort(422, 'Cannot delete purchase order under ' . $purchaseOrder->status->name . ' status.');
        }

        $purchaseOrder->delete();

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PurchaseOrder  $purchaseOrder
     * @return \Illuminate\Http\Response
     */
    public function destroyPurchaseOrderStore(PurchaseOrder $purchaseOrder, Store $store)
    {
        if ($purchaseOrder->status()->whereIn('code', ['approved', 'closed'])->count() > 0) {
            abort(422, 'Cannot delete store for purchase order under ' . $purchaseOrder->status->name . ' status.');
        }

        $store = $purchaseOrder
            ->stores()
            ->where([
                'store_id' => $store->id,
            ])
            ->first();

        $store->pivot->delete();

        return response()->noContent();
    }
}

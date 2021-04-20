<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderExpense;
use App\Models\PurchaseOrderStoreItem;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $filters = $request->input('filters');
        $search = $request->input('search') ?? [];
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $purchaseOrders = PurchaseOrder::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->with('status')
            ->whereHas('status', function ($query) use ($filters) {
                if (isset($filters['status'])) {
                    $query->where('id', '=', $filters['status']);
                }
            });

        if ($search && !empty($search['value'])) {
            $searchTerm = $search['value'];
            $purchaseOrders = $purchaseOrders->where(function ($query) use ($searchTerm) {
                $query
                    ->orWhere('code', 'like', '%' . $searchTerm . '%')
                    ->orWhere('location', 'like', '%' . $searchTerm . '%');
            });
        }

        $purchaseOrders = $purchaseOrders->paginate($perPage);

        return response()->json($purchaseOrders);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexPurchaseOrderLocations()
    {
        $purchaseOrderTableName = resolve(PurchaseOrder::class)->getTable();
        $locations = DB::table($purchaseOrderTableName)
            ->select([$purchaseOrderTableName . '.location'])
            ->orderBy($purchaseOrderTableName . '.location')
            ->groupBy($purchaseOrderTableName . '.location')
            ->get();

        return response()->json(['data' => $locations]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexPurchaseOrderStores(Request $request, PurchaseOrder $purchaseOrder)
    {
        $stores = $purchaseOrder
            ->stores()
            ->with('promodisers')
            ->orderBy('pivot_id', 'asc')
            ->get();

        $stores = $stores->unique('id')->values();

        $include = $request->input('include');

        $stores->each(function ($store) use ($purchaseOrder, $include) {
            $store->purchase_order_status = $purchaseOrder->status;
            if ($include === 'items') {
                $items = Item::
                    select([
                        'items.*',
                        'purchase_order_store_items.quantity_original',
                        'purchase_order_store_items.quantity_actual',
                        'purchase_order_store_items.quantity_bad_orders',
                        'purchase_order_store_items.quantity_returns',
                        'purchase_order_store_items.delivery_receipt_no',
                        'purchase_order_store_items.booklet_no',
                        'purchase_order_store_items.remarks',
                    ])
                    ->join(
                        'purchase_order_store_items',
                        function ($join) use ($purchaseOrder, $store) {
                            $join
                                ->on(
                                    'items.id',
                                    '=',
                                    'purchase_order_store_items.item_id'
                                )
                                ->where(
                                    'purchase_order_store_items.purchase_order_id',
                                    '=',
                                    $purchaseOrder->id
                                )
                                ->where(
                                    'purchase_order_store_items.store_id',
                                    '=',
                                    $store->id
                                );
                        }
                    )
                    ->get();
                $store->items = $items;
            }
        });

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
        $attributes['location'] = strtoupper($attributes['location']);

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
        $attributes = $request->all();

        if (array_key_exists('purchase_order_status_id', $attributes)) {
            if ($attributes['purchase_order_status_id'] == 3) {
                $purchaseOrderStoreItems = PurchaseOrderStoreItem::where('purchase_order_id', $purchaseOrder->id)
                    ->where(function ($query) {
                        $query
                            ->orWhere(function ($query) {
                                $query
                                    ->where(function ($query) {
                                        $query
                                            ->where('quantity_actual', '<=', 0)
                                            ->orWhereNull('quantity_actual');
                                    })
                                    ->where(function ($query) {
                                        $query
                                            ->where('quantity_returns', '<=', 0)
                                            ->orWhereNull('quantity_returns');
                                    });
                            })
                            ->orWhere('delivery_receipt_no', '=', '')
                            ->orWhereNull('delivery_receipt_no')
                            ->orWhere('booklet_no', '=', '')
                            ->orWhereNull('booklet_no');
                    })
                    ->get();
                $purchaseOrderExpenses = PurchaseOrderExpense::where('purchase_order_id', $purchaseOrder->id)
                    ->where(function ($query) {
                        $query
                            ->orWhere('amount_original', '<=', 0)
                            ->orWhereNull('amount_original')
                            ->orWhere('amount_actual', '<=', 0)
                            ->orWhereNull('amount_actual');
                    })
                    ->get();
                if (
                    $purchaseOrderStoreItems->count() > 0 ||
                    $purchaseOrderExpenses->count() > 0
                ) {
                    abort(422, 'Cannot close purchase order. Kindly update required details.');
                }
            } else {
                $purchaseOrderStoreItems = PurchaseOrderStoreItem::where('purchase_order_id', $purchaseOrder->id)->get();
                if ($purchaseOrderStoreItems->count() == 0) {
                    abort(422, 'Cannot approve purchase order. Kindly add store request items.');
                }
            }
        }

        $purchaseOrder
            ->fill($attributes)
            ->save();

        $purchaseOrder->status;

        return response()->json(['data' => $purchaseOrder]);
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

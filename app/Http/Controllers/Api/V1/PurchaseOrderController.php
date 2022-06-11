<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderExpense;
use App\Models\PurchaseOrderStoreItem;
use App\Models\PurchaseOrderStoresSortOrder;
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

        $purchaseOrderTableName = resolve(PurchaseOrder::class)->getTable();
        $purchaseOrders = PurchaseOrder::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->with('status')
            ->whereHas('status', function ($query) use ($filters) {
                if (isset($filters['status'])) {
                    $query->where('id', '=', $filters['status']);
                }
            });

        if (isset($filters['folder'])) {
            $purchaseOrders = $purchaseOrders->whereRaw(DB::raw('DATE_FORMAT('. $purchaseOrderTableName . '.from, "%Y-%m") = "' . $filters['folder'] . '"'));
        }

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
    public function indexPurchaseOrderFolders(Request $request)
    {
        $filters = $request->input('filters');
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $purchaseOrderTableName = resolve(PurchaseOrder::class)->getTable();
        $foldersQuery = DB::table($purchaseOrderTableName)
            ->select([
                DB::raw('DATE_FORMAT('. $purchaseOrderTableName . '.from, "%Y-%m") folder'),
            ])
            ->groupBy('folder')
            ->orderBy('folder', 'desc');

        if (isset($filters['status'])) {
            $foldersQuery = $foldersQuery->where($purchaseOrderTableName . '.purchase_order_status_id', '=', 3);
        }

        $folders = $foldersQuery->paginate($perPage);

        return response()->json($folders);
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
        $purchaseOrderFrom = $purchaseOrder->from;
        $stores = $purchaseOrder
            ->stores()
            ->with(['promodisers' => function ($query) use ($purchaseOrderFrom) {
                $query->whereHas('jobContracts', function ($query) use ($purchaseOrderFrom) {
                    $query
                        ->where(function ($query) use ($purchaseOrderFrom) {
                            $query
                                ->where('start_date', '<=', $purchaseOrderFrom)
                                ->where('end_date', '>=', $purchaseOrderFrom);
                        })
                        ->orWhere(function ($query) use ($purchaseOrderFrom) {
                            $query
                                ->where('start_date', '<=', $purchaseOrderFrom)
                                ->whereNull('end_date');
                        });
                });
            }])
            ->orderBy('pivot_id', 'asc')
            ->get();

        $stores = $stores->unique('id')->values();

        $include = $request->input('include');

        $sortOrder = 0;
        $storesSortOrder = $purchaseOrder->storesSortOrder;
        $stores->each(function ($store) use ($purchaseOrder, $include, &$sortOrder, $storesSortOrder) {
            ++$sortOrder;
            $storeSortOrder = $storesSortOrder->where('id', $store->id)->first();
            $store->sort_order = $storeSortOrder ? $storeSortOrder->pivot->sort_order : $sortOrder;
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

                $items->each(function ($item) use ($store, $purchaseOrder) {
					$effectivePrice = $this->getStoreEffectiveItemPrice($store->id, $item->id, $purchaseOrder->to);
                    $totalAmount = $item->quantity_original * $effectivePrice;
                    $item->effective_price = $effectivePrice;
                    $item->total_amount = $totalAmount;
                });
                
                $store->items = $items;
            }
        });
        $stores = $stores->sortBy('sort_order')->values();

        return response()->json(['data' => $stores]);
    }

     /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function syncPurchaseOrderStoresSortOrder(Request $request, PurchaseOrder $purchaseOrder)
    {
        $currentStoresSortOrder = $purchaseOrder->storesSortOrder;
        $updatedStoresSortOrder = collect($request->input('sort_order'));
        $stores = $purchaseOrder->stores()->get()->unique('id')->values();
        $data = $stores->map(function ($store) use ($stores, $currentStoresSortOrder, $updatedStoresSortOrder) {
            $sortOrder = $updatedStoresSortOrder->where('store_id', $store->id)->first();
            if (!$sortOrder) {
                $sortOrder = $currentStoresSortOrder->where('id', $store->id)->first();
                $sortOrder = $sortOrder ? $sortOrder->pivot->sort_order : $stores->count();
            } else {
                $sortOrder = $sortOrder['sort_order'];
            }
            return [
                'store_id' => $store->id,
                'sort_order' => $sortOrder,
            ];
        });

        $sortOrder = 0;
        $data = $data->sortBy('sort_order')->map(function ($item) use (&$sortOrder) {
            ++$sortOrder;
            $item['sort_order'] = $sortOrder;
            return $item;
        });
        $purchaseOrder->storesSortOrder()->sync($data);

        return response()->noContent();
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
                'code' => $this->generatePurchaseOrderCode(),
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
            $existingPurchaseOrderStoreItem = PurchaseOrderStoreItem::where([
                'purchase_order_id' => $purchaseOrder->id,
                'store_id' => $attributes['store_id'],
                'item_id' => $attributes['item_id'],
            ])->first();
            
            if (!$attributes['quantity_original']) {
                $existingPurchaseOrderStoreItem->delete();    
            } else {
                $existingPurchaseOrderStoreItem->quantity_original = $attributes['quantity_original'];
                $existingPurchaseOrderStoreItem->save();
            }
            return response()->noContent();
        }

        $purchaseOrder->items()->attach([
            $attributes['item_id'] => [
                'store_id' => $attributes['store_id'],
                'quantity_original' => $attributes['quantity_original']
            ]
        ]);

        $purchaseOrder->fresh();
        $storesSortOrder = $purchaseOrder->storesSortOrder
            ->whereNotIn('pivot.store_id', [$attributes['store_id']])
            ->values();
        $data = $storesSortOrder->map(function ($storeSortOrder) {
            return [
                'store_id' => $storeSortOrder->pivot->store_id,
                'sort_order' => $storeSortOrder->pivot->sort_order,
            ];
        })->toArray();
        $data[] = [
            'store_id' => $attributes['store_id'],
            'sort_order' => $storesSortOrder->count() + 1,
        ];
        $purchaseOrder->storesSortOrder()->sync($data);

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
                            ->orWhere('amount_actual', '<', 0);
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

        $poStores = $purchaseOrder
            ->stores()
            ->where([
                'store_id' => $store->id,
            ])
            ->get();

        foreach ($poStores as $poStore) {
            $poStore->pivot->delete();
        }        

        PurchaseOrderStoresSortOrder::where([
            'purchase_order_id' => $purchaseOrder->id,
            'store_id' => $store->id,
        ])->delete();

        $purchaseOrder->fresh();
        $storesSortOrder = $purchaseOrder
            ->storesSortOrder
            ->sortBy('pivot.sort_order')
            ->values();


        $sortOrder = 0;
        $data = $storesSortOrder->map(function ($storeSortOrder) use (&$sortOrder) {
            ++$sortOrder;
            return [
                'store_id' => $storeSortOrder->pivot->store_id,
                'sort_order' => $sortOrder,
            ];
        })->toArray();
        $purchaseOrder->storesSortOrder()->sync($data);

        return response()->noContent();
    }


    private function generatePurchaseOrderCode($increment = 1)
    {
        $code = date('Y') . '-' . str_pad(
            PurchaseOrder::where('code', 'like', date('Y') . '-%')->get()->count() + $increment,
            4,
            "0",
            STR_PAD_LEFT
        );

        $isExist = PurchaseOrder::where('code', '=', $code)->get()->count() > 0;

        if ($isExist) {
            return $this->generatePurchaseOrderCode(++$increment);
        }

        return $code;
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

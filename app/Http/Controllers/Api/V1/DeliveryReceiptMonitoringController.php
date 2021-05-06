<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\Store;
use stdClass;

class DeliveryReceiptMonitoringController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $purchaseOrdersQuery = PurchaseOrder::where('purchase_order_status_id', '=', 3)
            ->where('to', '>=', $request->input('from'))
            ->where('to', '<=', $request->input('to'));

        $storeId = null;
        $searchStore = null;
        if ($request->input('store_id')) {
            $storeId = $request->input('store_id');
            $searchStore = Store::findOrFail($storeId);
            $purchaseOrdersQuery
                ->whereHas('items', function($query) use ($storeId) {
                    $query->where('purchase_order_store_items.store_id', '=', $storeId);
                });
        }

        $purchaseOrders = $purchaseOrdersQuery->get();

        $booklets = collect();
        $purchaseOrders->each(function ($purchaseOrder) use ($booklets, $storeId) {
            $items = ($storeId)
                ? $purchaseOrder->items()->where('purchase_order_store_items.store_id', '=', $storeId)->get()
                : $purchaseOrder->items;
            $items->each(function ($item) use ($booklets, $purchaseOrder) {
                $booklet = $booklets->where('id', '=', $item->pivot->booklet_no)->first();
                if ($booklet) {
                    $deliveryReceipt = $booklet->deliveryReceipts->where('id', '=', $item->pivot->delivery_receipt_no)->first();
                    if ($deliveryReceipt) {
                        $store = $deliveryReceipt->stores->where('id', '=', $item->pivot->store_id)->first();
                        if ($store) {
                            $item->quantity_original = $item->pivot->quantity_original;
                            $item->quantity_actual = $item->pivot->quantity_actual;
                            $item->quantity_bad_orders = $item->pivot->quantity_bad_orders;
                            $item->quantity_returns = $item->pivot->quantity_returns;
                            $store->items->push(
                                (object)$item->only([
                                    'id',
                                    'code',
                                    'name',
                                    'quantity_original',
                                    'quantity_actual',
                                    'quantity_bad_orders',
                                    'quantity_returns',
                                ])
                            );
                        }
                    } else {
                        $newDeliveryReceipt = $this->createNewDeliveryReceipt($purchaseOrder, $item);
                        $newDeliveryReceipt->stores = collect();
                        $store = Store::findOrFail($item->pivot->store_id);
                        $item->quantity_original = $item->pivot->quantity_original;
                        $item->quantity_actual = $item->pivot->quantity_actual;
                        $item->quantity_bad_orders = $item->pivot->quantity_bad_orders;
                        $item->quantity_returns = $item->pivot->quantity_returns;
                        $store->items = collect();
                        $store->items->push((object)$item->only([
                            'id',
                            'code',
                            'name',
                            'quantity_original',
                            'quantity_actual',
                            'quantity_bad_orders',
                            'quantity_returns',
                        ]));
                        $newDeliveryReceipt->stores->push((object)$store->only(['id', 'code', 'name', 'items']));
                        $booklet->deliveryReceipts->push($newDeliveryReceipt);
                    }

                } else {
                    $newBooklet = new stdClass();
                    $newBooklet->id = $item->pivot->booklet_no;

                    $newDeliveryReceipt = $this->createNewDeliveryReceipt($purchaseOrder, $item);

                    $store = Store::findOrFail($item->pivot->store_id);

                    $item->quantity_original = $item->pivot->quantity_original;
                    $item->quantity_actual = $item->pivot->quantity_actual;
                    $item->quantity_bad_orders = $item->pivot->quantity_bad_orders;
                    $item->quantity_returns = $item->pivot->quantity_returns;
                    $store->items = collect();
                    $store->items->push((object)$item->only([
                        'id',
                        'code',
                        'name',
                        'quantity_original',
                        'quantity_actual',
                        'quantity_bad_orders',
                        'quantity_returns',
                    ]));
                    $newDeliveryReceipt->stores = collect();
                    $newDeliveryReceipt->stores->push((object)$store->only(['id', 'code', 'name', 'items']));

                    $newBooklet->deliveryReceipts = collect();
                    $newBooklet->deliveryReceipts->push($newDeliveryReceipt);

                    $booklets->push($newBooklet);
                }
            });
        });

        $booklets->each(function ($booklet) {
            $booklet->deliveryReceipts = $booklet->deliveryReceipts->sortBy('id')->values();
            $booklet->quantity_original = 0;
            $booklet->quantity_actual = 0;
            $booklet->quantity_bad_orders = 0;
            $booklet->quantity_returns = 0;
            $booklet->deliveryReceipts->each(function ($deliveryReceipt) use ($booklet) {
                $deliveryReceipt->stores->each(function ($store) use ($booklet, $deliveryReceipt) {
                    $deliveryReceipt->quantity_original = $store->items->sum('quantity_original');
                    $deliveryReceipt->quantity_actual = $store->items->sum('quantity_actual');
                    $deliveryReceipt->quantity_bad_orders = $store->items->sum('quantity_bad_orders');
                    $deliveryReceipt->quantity_returns = $store->items->sum('quantity_returns');

                    $booklet->quantity_original += $store->items->sum('quantity_original');
                    $booklet->quantity_actual += $store->items->sum('quantity_actual');
                    $booklet->quantity_bad_orders += $store->items->sum('quantity_bad_orders');
                    $booklet->quantity_returns += $store->items->sum('quantity_returns');
                });
            });
        });
        $booklets = $booklets->sortBy('id')->values();

        return response()->json([
            'data' => $booklets,
            'meta' => [
                'search_filters' => array_merge(
                    $request->only(['from', 'to']),
                    ['store' => ($searchStore ? $searchStore->only('code', 'name') : null)]
                )
            ]
        ]);
    }

    private function createNewDeliveryReceipt(PurchaseOrder $purchaseOrder, Item $item)
    {
        $newDeliveryReceipt = new stdClass();
        $newDeliveryReceipt->id = $item->pivot->delivery_receipt_no;
        $newDeliveryReceipt->purchase_order = $purchaseOrder->only(['id', 'code', 'from', 'to']);

        return $newDeliveryReceipt;
    }
}

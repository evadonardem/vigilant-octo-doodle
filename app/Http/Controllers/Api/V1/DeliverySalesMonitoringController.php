<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\Store;
use stdClass;

class DeliverySalesMonitoringController extends Controller
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
                ->whereHas('items', function ($query) use ($storeId) {
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
                            $item->quantity_actual = $item->pivot->quantity_actual;
                            $item->effective_price = $this->getStoreEffectiveItemPrice(
                                $item->pivot->store_id,
                                $item->id,
                                $purchaseOrder->to
                            );
                            $item->amount = number_format(
                                $item->pivot->quantity_actual * $item->effective_price,
                                2,
                                '.',
                                ''
                            );

                            $store->items->push(
                                (object)$item->only([
                                    'id',
                                    'code',
                                    'name',
                                    'quantity_actual',
                                    'effective_price',
                                    'amount'
                                ])
                            );
                        }
                    } else {
                        $newDeliveryReceipt = $this->createNewDeliveryReceipt($purchaseOrder, $item);
                        $newDeliveryReceipt->stores = collect();
                        $store = Store::findOrFail($item->pivot->store_id);
                        $item->quantity_actual = $item->pivot->quantity_actual;
                        $item->effective_price = $this->getStoreEffectiveItemPrice($store->id, $item->id, $purchaseOrder->to);
                        $item->amount = number_format(
                            $item->pivot->quantity_actual * $item->effective_price,
                            2,
                            '.',
                            ''
                        );
                        $store->items = collect();
                        $store->items->push((object)$item->only(['id', 'code', 'name', 'quantity_actual', 'effective_price', 'amount']));
                        $newDeliveryReceipt->stores->push((object)$store->only(['id', 'code', 'name', 'items']));
                        $booklet->deliveryReceipts->push($newDeliveryReceipt);
                    }
                } else {
                    $newBooklet = new stdClass();
                    $newBooklet->id = $item->pivot->booklet_no;

                    $newDeliveryReceipt = $this->createNewDeliveryReceipt($purchaseOrder, $item);

                    $store = Store::findOrFail($item->pivot->store_id);

                    $item->quantity_actual = $item->pivot->quantity_actual;
                    $item->effective_price = $this->getStoreEffectiveItemPrice($store->id, $item->id, $purchaseOrder->to);
                    $item->amount = number_format(
                        $item->pivot->quantity_actual * $item->effective_price,
                        2,
                        '.',
                        ''
                    );
                    $store->items = collect();
                    $store->items->push((object)$item->only(['id', 'code', 'name', 'quantity_actual', 'effective_price', 'amount']));
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
            $booklet->amount = 0;
            $booklet->deliveryReceipts->each(function ($deliveryReceipt) use ($booklet) {
                $deliveryReceipt->stores->each(function ($store) use ($booklet, $deliveryReceipt) {
                    $deliveryReceipt->amount = $store->items->sum('amount');
                    $booklet->amount += $store->items->sum('amount');
                });
                $deliveryReceipt->amount = number_format($deliveryReceipt->amount, 2, '.', '');
            });
            $booklet->amount = number_format($booklet->amount, 2, '.', '');
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

<?php

namespace App\Repositories;

use App\Models\PurchaseOrder;
use App\Models\Store;
use App\Models\StoreItemPrice;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Pagination\LengthAwarePaginator;

class StoreRepository
{
    public function __construct(
        protected DeliveryReceiptPaymentRepository $deliveryReceiptPaymentRepository,
        protected Store $store,
        protected PurchaseOrder $purchaseOrder,
        protected StoreItemPrice $storeItemPrice
    ) {
    }

    public function getStoresPayments(
        int $perPage,
        array $filters = []
    ): LengthAwarePaginator {
        $purchaseOrderTable = $this->purchaseOrder->getTable();
        $storeItemPriceTable = $this->storeItemPrice->getTable();

        $storesQuery = $this->store
            ->newQuery()
            ->with('category')
            ->with('deliveryReceiptPayments', function (HasMany $query) use ($filters) {
                if ($filters['delivery_receipt_no'] ?? false) {
                    $query->where('delivery_receipt_no', $filters['delivery_receipt_no']);
                }
            })
            ->with('purchaseOrderItems', function ($query) use ($filters, $purchaseOrderTable, $storeItemPriceTable) {
                $relationTable = $query->getModel()->getTable();
                $query
                    ->select([
                        "{$relationTable}.*",
                        "{$purchaseOrderTable}.code AS purchase_order_code",
                    ])
                    ->selectSub("SELECT
                            amount * {$relationTable}.quantity_actual
                        FROM {$storeItemPriceTable}
                        WHERE {$storeItemPriceTable}.store_id = {$relationTable}.store_id
                            AND {$storeItemPriceTable}.item_id = {$relationTable}.item_id
                            AND {$storeItemPriceTable}.effectivity_date <= {$purchaseOrderTable}.to
                        ORDER BY {$storeItemPriceTable}.effectivity_date DESC
                        LIMIT 1", 'amount_due')
                    ->with('item')
                    ->join(
                        $purchaseOrderTable,
                        "{$relationTable}.purchase_order_id",
                        "{$purchaseOrderTable}.id"
                    )
                    ->where([
                        "{$purchaseOrderTable}.purchase_order_status_id" => 3,
                    ])
                    ->groupBy([
                        "{$relationTable}.purchase_order_id",
                        "{$relationTable}.store_id",
                        "{$relationTable}.item_id",
                    ]);

                if ($filters['delivery_receipt_no'] ?? false) {
                    $deliveryReceiptNo = $filters['delivery_receipt_no'];
                    $query->where("{$relationTable}.delivery_receipt_no", $deliveryReceiptNo);
                }

                if (($filters['coverage_from'] ?? false) && ($filters['coverage_to'] ?? false)) {
                    $query->where("{$purchaseOrderTable}.from", '>=', $filters['coverage_from']);
                    $query->where("{$purchaseOrderTable}.from", '<=', $filters['coverage_to']);
                    $query->where("{$purchaseOrderTable}.to", '>=', $filters['coverage_from']);
                    $query->where("{$purchaseOrderTable}.to", '<=', $filters['coverage_to']);
                } elseif ($filters['coverage_from'] ?? false) {
                    $query->where("{$purchaseOrderTable}.from", '>=', $filters['coverage_from']);
                    $query->where("{$purchaseOrderTable}.to", '>=', $filters['coverage_from']);
                } else {
                    if ($filters['coverage_to'] ?? false) {
                        $query->where("{$purchaseOrderTable}.from", '<=', $filters['coverage_to']);
                        $query->where("{$purchaseOrderTable}.to", '<=', $filters['coverage_to']);
                    }
                }
            })
            ->whereHas('purchaseOrderItems', function ($query) use ($filters, $purchaseOrderTable, $storeItemPriceTable) {
                $relationTable = $query->getModel()->getTable();
                $query
                    ->select([
                        "{$relationTable}.*",
                        "{$purchaseOrderTable}.code AS purchase_order_code",
                    ])
                    ->selectSub("SELECT
                            amount * {$relationTable}.quantity_actual
                        FROM {$storeItemPriceTable}
                        WHERE {$storeItemPriceTable}.store_id = {$relationTable}.store_id
                            AND {$storeItemPriceTable}.item_id = {$relationTable}.item_id
                            AND {$storeItemPriceTable}.effectivity_date <= {$purchaseOrderTable}.to
                        ORDER BY {$storeItemPriceTable}.effectivity_date DESC
                        LIMIT 1", 'amount_due')
                    ->with('item')
                    ->join(
                        $purchaseOrderTable,
                        "{$relationTable}.purchase_order_id",
                        "{$purchaseOrderTable}.id"
                    )
                    ->where([
                        "{$purchaseOrderTable}.purchase_order_status_id" => 3,
                    ])
                    ->groupBy([
                        "{$relationTable}.purchase_order_id",
                        "{$relationTable}.store_id",
                        "{$relationTable}.item_id",
                    ]);

                if ($filters['delivery_receipt_no'] ?? false) {
                    $deliveryReceiptNo = $filters['delivery_receipt_no'];
                    $query->where("{$relationTable}.delivery_receipt_no", $deliveryReceiptNo);
                }

                if (($filters['coverage_from'] ?? false) && ($filters['coverage_to'] ?? false)) {
                    $query->where("{$purchaseOrderTable}.from", '>=', $filters['coverage_from']);
                    $query->where("{$purchaseOrderTable}.from", '<=', $filters['coverage_to']);
                    $query->where("{$purchaseOrderTable}.to", '>=', $filters['coverage_from']);
                    $query->where("{$purchaseOrderTable}.to", '<=', $filters['coverage_to']);
                } elseif ($filters['coverage_from'] ?? false) {
                    $query->where("{$purchaseOrderTable}.from", '>=', $filters['coverage_from']);
                    $query->where("{$purchaseOrderTable}.to", '>=', $filters['coverage_from']);
                } else {
                    if ($filters['coverage_to'] ?? false) {
                        $query->where("{$purchaseOrderTable}.from", '<=', $filters['coverage_to']);
                        $query->where("{$purchaseOrderTable}.to", '<=', $filters['coverage_to']);
                    }
                }
            });

        if ($filters['store_id'] ?? false) {
            $storesQuery->where('id', '=', $filters['store_id']);
        }

        if (isset($filters['category_id'])) {
            $categoryId = $filters['category_id'];
            if ($categoryId > 0) {
                $storesQuery->where('category_id', '=', $categoryId);
            } else {
                $storesQuery->whereNull('category_id');
            }
        }

        $stores = $storesQuery->paginate($perPage);

        $stores->map(function ($store) use ($filters) {
            $purchaseOrderItemsGroupByDeliveryReceipt = $store->purchaseOrderItems
                ->groupBy('delivery_receipt_no');

            $deliveryReceiptNos = array_keys($purchaseOrderItemsGroupByDeliveryReceipt->toArray());
            $paymentsByDeliveryReceipt = $store->deliveryReceiptPayments->groupBy('delivery_receipt_no');

            $deliveryReceiptsPayments = collect();
            $deliveryReceiptsTotalAmountDue = 0;
            $deliveryReceiptsTotalPayments = 0;
            $deliveryReceiptsTotalBalance = 0;

            foreach ($deliveryReceiptNos as $deliveryReceiptNo) {
                $deliveryRecetipNoPayments = $paymentsByDeliveryReceipt->get($deliveryReceiptNo);
                $purchaseOrderItemsByDeliveryReceipt =
                    $purchaseOrderItemsGroupByDeliveryReceipt->get($deliveryReceiptNo);
                $deliveryReceiptTotalAmountDue =
                    $purchaseOrderItemsByDeliveryReceipt->sum('amount_due');
                $deliveryReceiptTotalPayments = $deliveryRecetipNoPayments?->sum('amount') ?? 0;
                $deliveryReceiptTotalBalance = $deliveryReceiptTotalAmountDue - $deliveryReceiptTotalPayments;

                $deliveryReceiptsTotalAmountDue += $deliveryReceiptTotalAmountDue;
                $deliveryReceiptsTotalPayments += $deliveryReceiptTotalPayments;
                $deliveryReceiptsTotalBalance += $deliveryReceiptTotalBalance;

                if ($filters['payment_status'] ?? false) {
                    if (
                        $filters['payment_status'] === 'paid' &&
                        $deliveryReceiptTotalBalance > 0
                    ) {
                        continue;
                    }

                    if (
                        $filters['payment_status'] === 'unpaid' &&
                        $deliveryReceiptTotalBalance <= 0
                    ) {
                        continue;
                    }
                }

                $deliveryReceipt = collect([
                    'store_id' => $store->id,
                    'delivery_receipt_no' => $deliveryReceiptNo,
                    'payments' => $deliveryRecetipNoPayments ?? [],
                    'total_amount_due' => $deliveryReceiptTotalAmountDue,
                    'total_payments' => $deliveryReceiptTotalPayments,
                    'total_balance' => $deliveryReceiptTotalBalance,
                    'purchase_order_items' => $purchaseOrderItemsByDeliveryReceipt,
                ]);

                $deliveryReceiptsPayments->push($deliveryReceipt);
            }

            $store->delivery_receipt_nos = $deliveryReceiptsPayments;
            $store->delivery_receipt_total_amount_due = $deliveryReceiptsTotalAmountDue;
            $store->delivery_receipt_total_payments = $deliveryReceiptsTotalPayments;
            $store->delivery_receipt_total_balance = $deliveryReceiptsTotalBalance;

            $store->unsetRelation('deliveryReceiptPayments');
            $store->unsetRelation('purchaseOrderItems');
        });

        return $stores;
    }
}

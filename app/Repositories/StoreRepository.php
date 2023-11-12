<?php

namespace App\Repositories;

use App\Models\PurchaseOrder;
use App\Models\Store;
use App\Models\StoreItemPrice;
use Illuminate\Pagination\LengthAwarePaginator;

class StoreRepository
{
    public function __construct(
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
                    ->with('payments')
                    ->withSum('payments', 'amount')
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

                if ($filters['purchase_order_id'] ?? false) {
                    $purchaseOrderId = $filters['purchase_order_id'];
                    $purchaseOrderIds = is_array($purchaseOrderId) ? $purchaseOrderId : [$purchaseOrderId];
                    $query->whereIn("{$relationTable}.purchase_order_id", $purchaseOrderIds);
                }

                if ($filters['payment_status'] ?? false) {
                    if ($filters['payment_status'] === 'paid') {
                        $query->havingRaw('payments_sum_amount >= SUM(amount_due)');
                    } else {
                        if ($filters['payment_status'] === 'unpaid') {
                            $query->havingRaw('(payments_sum_amount IS NULL OR payments_sum_amount < SUM(amount_due))');
                        }
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
                    ->with('payments')
                    ->withSum('payments', 'amount')
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

                if ($filters['purchase_order_id'] ?? false) {
                    $purchaseOrderId = $filters['purchase_order_id'];
                    $purchaseOrderIds = is_array($purchaseOrderId) ? $purchaseOrderId : [$purchaseOrderId];
                    $query->whereIn("{$relationTable}.purchase_order_id", $purchaseOrderIds);
                }

                if ($filters['payment_status'] ?? false) {
                    if ($filters['payment_status'] === 'paid') {
                        $query->havingRaw('payments_sum_amount >= SUM(amount_due)');
                    } else {
                        if ($filters['payment_status'] === 'unpaid') {
                            $query->havingRaw('(payments_sum_amount IS NULL OR payments_sum_amount < SUM(amount_due))');
                        }
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

        return $storesQuery->paginate($perPage);
    }
}

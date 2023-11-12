<?php

namespace App\Repositories;

use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Collection;

class PurchaseOrderRepository
{
    public function __construct(
        private PurchaseOrder $model
    ) {}

    public function getPuchaseOrders(array $filters): Collection
    {
        $query = $this->model->newQuery();

        if ($filters['purchase_order_status_id'] ?? false) {
            $purchaseOrderStatusId = $filters['purchase_order_status_id'];
            $query->where('purchase_order_status_id', $purchaseOrderStatusId);
        }

        if ($filters['store_id'] ?? false) {
            $storeId = $filters['store_id'];
            $query->whereHas('stores', function ($query) use ($storeId) {
                $query->where('stores.id', $storeId);
            });
        }

        if (isset($filters['category_id'])) {
            $categoryId = $filters['category_id'];
            if ($categoryId > 0) {
                $query->whereHas('stores.category', function ($query) use ($categoryId) {
                    $query->where('id', $categoryId);
                });
            } else {
                $query->whereDoesntHave('stores.category');
            }
        }

        $query->orderBy('from', 'desc')->orderBy('to', 'desc');

        return $query->get();
    }
}

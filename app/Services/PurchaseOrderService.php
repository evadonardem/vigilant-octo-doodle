<?php

namespace App\Services;

use App\Repositories\PurchaseOrderRepository;
use Illuminate\Database\Eloquent\Collection;

class PurchaseOrderService
{

    public function __construct(
        private PurchaseOrderRepository $repository
    ) {}

    public function getDropdownPurchaseOrders(array $filters): Collection
    {
        return $this->repository->getPuchaseOrders($filters);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DropdownPurchaseOrderResource;
use App\Services\PurchaseOrderService;
use Illuminate\Http\Request;

class DropdownPurchaseOrderController extends Controller
{
    public function __construct(
        protected PurchaseOrderService $purchaseOrderService
    ) {
    }

    public function index(Request $request)
    {
        $payload = $request->only(['filters']);
        $filters = $payload['filters'] ?? [];

        $purchaseOrders = $this->purchaseOrderService->getDropdownPurchaseOrders($filters);
        return DropdownPurchaseOrderResource::collection($purchaseOrders);
    }
}

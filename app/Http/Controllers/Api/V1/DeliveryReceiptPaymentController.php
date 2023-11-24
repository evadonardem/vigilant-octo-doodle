<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryReceiptPaymentRequest;
use App\Models\DeliveryReceiptPayment;
use App\Models\PurchaseOrderStoreItem;
use App\Repositories\StoreRepository;
use App\Services\DeliveryReceiptPaymentService;
use Illuminate\Pagination\Paginator;

class DeliveryReceiptPaymentController extends Controller
{
    public function __construct(
        protected DeliveryReceiptPaymentService $deliveryReceiptPaymentService,
        protected StoreRepository $storeRepository
    ) {
    }

    public function index()
    {
        $page = request()->input('page', 1);
        $perPage = request()->input('per_page', 10);
        $filters = request('filters', []);

        Paginator::currentPageResolver(fn () => $page);

        $stores = $this->storeRepository->getStoresPayments($perPage, $filters);

        return $stores;
    }

    public function store(
        StoreDeliveryReceiptPaymentRequest $request,
        PurchaseOrderStoreItem $purchaseOrderStoreItem
    ) {
        $paymentDetails = $request->only(['payment_date', 'amount', 'remarks']);

        return $this->deliveryReceiptPaymentService->createPayment($purchaseOrderStoreItem, $paymentDetails)
            ? response()->noContent()
            : abort(400);
    }

    public function destroy(
        PurchaseOrderStoreItem $purchaseOrderStoreItem,
        DeliveryReceiptPayment $deliveryReceiptPayment
    ) {
        if ($purchaseOrderStoreItem->id !== $deliveryReceiptPayment->purchase_order_store_item_id) {
            abort(400);
        }

        return $deliveryReceiptPayment->delete() ? response()->noContent() : abort(400);
    }
}

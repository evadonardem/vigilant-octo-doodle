<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryReceiptPaymentRequest;
use App\Models\DeliveryReceiptPayment;
use App\Models\Store;
use App\Repositories\StoreRepository;
use App\Services\DeliveryReceiptPaymentService;
use Illuminate\Pagination\Paginator;

class DeliveryReceiptPaymentController extends Controller
{
    public function __construct(
        protected DeliveryReceiptPaymentService $deliveryReceiptPaymentService,
        protected StoreRepository $storeRepository
    ) {
        $this->middleware('can:View delivery receipt payments')->only('index');
        $this->middleware('can:Create or update delivery receipt payments')->only('store');
        $this->middleware('can:Delete delivery receipt payments')->only('destroy');
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
        Store $store
    ) {
        $paymentDetails = $request->only(['delivery_receipt_no', 'payment_date', 'amount', 'remarks']);

        return $this->deliveryReceiptPaymentService->createPayment($store, $paymentDetails)
            ? response()->noContent()
            : abort(400);
    }

    public function destroy(
        Store $store,
        DeliveryReceiptPayment $deliveryReceiptPayment
    ) {
        if ($store->id !== $deliveryReceiptPayment->store_id) {
            abort(400);
        }

        return $deliveryReceiptPayment->delete() ? response()->noContent() : abort(400);
    }
}

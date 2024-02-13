<?php

namespace App\Services;

use App\Models\Store;
use App\Repositories\DeliveryReceiptPaymentRepository;

class DeliveryReceiptPaymentService
{
    public function __construct(
        private DeliveryReceiptPaymentRepository $deliveryReceiptPaymentRepository
    ) {
    }

    public function createPayment(
        Store $store,
        array $paymentDetails
    ): bool {
        $paymentDetails = array_merge(['store_id' => $store->id], $paymentDetails);

        return $this->deliveryReceiptPaymentRepository->insertDeliveryReceiptPayment($paymentDetails);
    }
}

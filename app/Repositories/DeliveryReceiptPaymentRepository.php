<?php

namespace App\Repositories;

use App\Models\DeliveryReceiptPayment;

class DeliveryReceiptPaymentRepository
{
    public function __construct(
        protected DeliveryReceiptPayment $deliveryReceiptPayment
    ) {
    }

    public function insertDeliveryReceiptPayment(array $paymentDetails): bool
    {
        return (bool) $this->deliveryReceiptPayment
            ->newQuery()
            ->create($paymentDetails);
    }
}

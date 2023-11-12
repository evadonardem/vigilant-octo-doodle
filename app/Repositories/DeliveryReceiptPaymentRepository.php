<?php

namespace App\Repositories;

use App\Models\DeliveryReceiptPayment;
use App\Models\PurchaseOrderStoreItem;

class DeliveryReceiptPaymentRepository
{
    public function __construct(
        private DeliveryReceiptPayment $deliveryReceiptPayment,
        private PurchaseOrderStoreItem $purchaseOrderStoreItem
    ) {
    }

    public function insertDeliveryReceiptPayment(array $paymentDetails): bool
    {
        return (bool)$this->deliveryReceiptPayment
            ->newQuery()
            ->create($paymentDetails);
    }
}

<?php

namespace App\Services;

use App\Models\PurchaseOrderStoreItem;
use App\Repositories\DeliveryReceiptPaymentRepository;

class DeliveryReceiptPaymentService
{

    public function __construct(
        private DeliveryReceiptPaymentRepository $deliveryReceiptPaymentRepository
    ) {
    }

    public function createPayment(
        PurchaseOrderStoreItem $purchaseOrderStoreItem,
        array $paymentDetails
    ): bool {
        $paymentDetails = array_merge(
            [
                'purchase_order_store_item_id' => $purchaseOrderStoreItem->id,
            ],
            $paymentDetails
        );

        return $this->deliveryReceiptPaymentRepository
            ->insertDeliveryReceiptPayment($paymentDetails);
    }
}

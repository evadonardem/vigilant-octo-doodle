<?php

namespace Database\Seeders;

use App\Models\DeliveryReceiptPayment;
use App\Models\PurchaseOrder;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DeliveryReceiptPaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $closedPurchaseOrders = PurchaseOrder::where('purchase_order_status_id', 3)
            ->whereHas('items')
            ->get();

        $data = $closedPurchaseOrders
            ->pluck('items.*.pivot.id')
            ->flatten()
            ->random(10)
            ->map(function (int $purchaseOrderStoreItemId) {
                return [
                    'payment_date' => Carbon::now()
                        ->addDays(random_int(1, 7))
                        ->format('Y-m-d'),
                    'purchase_order_store_item_id' => $purchaseOrderStoreItemId,
                    'amount' => random_int(1, 100),
                    'remarks' => 'Payment remarks.',
                ];
            })
            ->toArray();

        DeliveryReceiptPayment::insert($data);
    }
}

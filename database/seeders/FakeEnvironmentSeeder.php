<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderStoreItem;
use App\Models\Store;
use App\Models\StoreItemPrice;
use Illuminate\Database\Seeder;

class FakeEnvironmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $stores = Store::factory(10)->create();
        $items = Item::factory(10)->create();

        $stores->each(fn($store) => (
            $items->each(fn($item) => (
                StoreItemPrice::factory()
                ->count(5)
                ->create([
                    'store_id' => $store->id,
                    'item_id' => $item->id,
                ])
            ))
        ));

        $purchaseOrders = PurchaseOrder::factory(100)->create();
        foreach ($stores->random(3) as $store) {
            PurchaseOrderStoreItem::create([
                'purchase_order_id' => $purchaseOrders->random()->id,
                'store_id' => $store->id,
                'item_id' => $items->first()->id,
                'quantity_original' => random_int(1, 100),
            ]);
        }
    }
}

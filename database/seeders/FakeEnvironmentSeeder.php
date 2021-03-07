<?php

namespace Database\Seeders;

use App\Models\Item;
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
    }
}

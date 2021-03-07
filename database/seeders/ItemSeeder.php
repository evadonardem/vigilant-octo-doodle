<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Store;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Item::factory()->count(10)->create();
    }
}

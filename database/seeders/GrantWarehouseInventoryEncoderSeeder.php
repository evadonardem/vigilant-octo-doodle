<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class GrantWarehouseInventoryEncoderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::find(2)->assignRole('Warehouse Inventory Encoder');
    }
}

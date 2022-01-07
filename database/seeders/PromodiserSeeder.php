<?php

namespace Database\Seeders;

use App\Models\Promodiser;
use App\Models\Store;
use Illuminate\Database\Seeder;

class PromodiserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Promodiser::factory()->count(10)->create([
            'store_id' => Store::all()->first()->id,
        ]);
    }
}

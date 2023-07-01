<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class FakeUsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = User::factory()->hasRates(5)->count(10)->create();
    }
}

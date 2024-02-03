<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class GrantSuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::find(1)->assignRole('Super Admin');
    }
}

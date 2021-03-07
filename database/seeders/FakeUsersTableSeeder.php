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
        $users->each(function ($user) {
            $user->roles()->sync([
              'STAFF' => [
                   'created_at' => '1970-01-02',
                   'updated_at' => '1970-01-02'
               ]
            ]);
        });
    }
}

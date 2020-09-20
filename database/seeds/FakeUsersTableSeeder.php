<?php

use Illuminate\Database\Seeder;
use App\User;
use App\Models\Rate;
use App\Models\RateType;
use Carbon\Carbon;

class FakeUsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = factory(User::class, 10)->create();
        $users->each(function ($user) {
            $user->roles()->sync([
              'STAFF' => [
                   'created_at' => '1970-01-02',
                   'updated_at' => '1970-01-02'
               ]
            ]);
            $perHourRateType = RateType::where('code', 'per_hour')->first();
            $perDeliveryRateType = RateType::where('code', 'per_delivery')->first();
            $user->rates()->saveMany(factory(Rate::class, 1)->make([
                'rate_type_id' => $perHourRateType->id,
            ]));
            $user->rates()->saveMany(factory(Rate::class, 1)->make([
                'rate_type_id' => $perDeliveryRateType->id,
            ]));
        });
    }
}

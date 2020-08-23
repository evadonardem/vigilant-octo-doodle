<?php

use App\User;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\CommonTimeShift;
use App\Models\RateType;
use Carbon\Carbon;

class GeneralDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = [
          'TEACHING' => '',
          'NON-TEACHING' => '',
          'MAINTENANCE' => '',
          'INTEGRATION FACILITATOR (PHOENIX)' => ''
        ];

        foreach ($roles as $id => $description) {
            $role = Role::where('id', $id)->first();
            if (!$role) {
                Role::create([
                  'id' => $id,
                  'description' => $description
                ]);
            }
        }

        $users = User::all();
        $users->each(function ($user) {
            if ($user->roles->count() == 0) {
                $user->roles()->sync([
                  'TEACHING' => [
                    'created_at' => '1970-02-02',
                    'updated_at' => '1970-02-02'
                  ]
                ]);
            }
        });

        $commonTimeShift = CommonTimeShift::whereNull('role_id')
            ->whereNull('effectivity_date')
            ->first();

        if (!$commonTimeShift) {
            CommonTimeShift::create([
              'expected_time_in' => '07:30',
              'expected_time_out' => '16:30'
            ]);
        }

        $rateTypes = RateType::all();
        if ($rateTypes->count() == 0) {
            RateType::create([
              'title' => 'Per Hour',
              'code' => 'per_hour',
            ]);
            RateType::create([
              'title' => 'Per Delivery',
              'code' => 'per_delivery',
            ]);
        }
    }
}

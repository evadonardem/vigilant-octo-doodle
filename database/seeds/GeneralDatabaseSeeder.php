<?php

use App\User;
use Illuminate\Database\Seeder;
use App\Models\CommonTimeShift;
use App\Models\DeductionType;
use App\Models\RateType;
use App\Models\Role;
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
          'STAFF' => '',
          'DRIVER' => '',
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
                  'STAFF' => [
                    'created_at' => '1970-02-02',
                    'updated_at' => '1970-02-02'
                  ]
                ]);
            }
        });

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

        $deductionTypes = DeductionType::all();
        if ($deductionTypes->count() == 0) {
            DeductionType::create([
                'title' => 'SSS',
                'code' => 'sss'
            ]);
            DeductionType::create([
              'title' => 'PHILHEALTH',
              'code' => 'philhealth'
            ]);
            DeductionType::create([
              'title' => 'Paluwagan',
              'code' => 'paluwagan'
            ]);
            DeductionType::create([
              'title' => 'Cash Advance',
              'code' => 'cash_advance'
            ]);
            DeductionType::create([
              'title' => 'Others',
              'code' => 'others'
            ]);
        }
    }
}

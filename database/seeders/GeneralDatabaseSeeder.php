<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\DeductionType;
use App\Models\OvertimeRate;
use App\Models\OvertimeRateType;
use App\Models\PurchaseOrderStatus;
use App\Models\RateType;
use App\Models\Role;

class GeneralDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
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

        $overtimeRateTypes = OvertimeRateType::all();
        if ($overtimeRateTypes->count() == 0) {
            $types = [
                [
                    'title' => 'Normal Day',
                    'code' => 'normal_day',
                ],
                [
                    'title' => 'Rest Day',
                    'code' => 'rest_day',
                ],
                [
                    'title' => 'Special Non-Working Day',
                    'code' => 'special_non_working_day',
                ],
                [
                    'title' => 'Special Non-Working Day and Rest Day',
                    'code' => 'special_non_working_day_and_rest_day',
                ],
                [
                    'title' => 'Regular Holiday',
                    'code' => 'regular_holiday',
                ],
                [
                    'title' => 'Regular Holiday and Rest Day',
                    'code' => 'regular_holiday_and_rest_day',
                ],
            ];

            foreach ($types as $type) {
                OvertimeRateType::create($type);
            }
        }

        $overtimeRates = OvertimeRate::all();
        if ($overtimeRates->count() == 0) {
            OvertimeRate::create([
                'overtime_rate_type_id' => OvertimeRateType::where('code', 'normal_day')->first()->id,
                'effectivity_date' => '2021-01-01',
                'non_night_shift' => 1.25,
                'night_shift' => 1.375,
            ]);
            OvertimeRate::create([
                'overtime_rate_type_id' => OvertimeRateType::where('code', 'rest_day')->first()->id,
                'effectivity_date' => '2021-01-01',
                'non_night_shift' => 1.69,
                'night_shift' => 1.859,
            ]);
            OvertimeRate::create([
                'overtime_rate_type_id' => OvertimeRateType::where('code', 'special_non_working_day')->first()->id,
                'effectivity_date' => '2021-01-01',
                'non_night_shift' => 1.69,
                'night_shift' => 1.859,
            ]);
            OvertimeRate::create([
                'overtime_rate_type_id' => OvertimeRateType::where('code', 'special_non_working_day_and_rest_day')->first()->id,
                'effectivity_date' => '2021-01-01',
                'non_night_shift' => 1.95,
                'night_shift' => 2.145,
            ]);
            OvertimeRate::create([
                'overtime_rate_type_id' => OvertimeRateType::where('code', 'regular_holiday')->first()->id,
                'effectivity_date' => '2021-01-01',
                'non_night_shift' => 2.6,
                'night_shift' => 2.86,
            ]);
            OvertimeRate::create([
                'overtime_rate_type_id' => OvertimeRateType::where('code', 'regular_holiday_and_rest_day')->first()->id,
                'effectivity_date' => '2021-01-01',
                'non_night_shift' => 3.38,
                'night_shift' => 3.718,
            ]);
        }

        $purchaseOrderStatuses = [
            [
                'code' => 'pending',
                'name' => 'Pending',
                'description' => 'Pending purchase order.',
            ],
            [
                'code' => 'approved',
                'name' => 'Approved',
                'description' => 'Approved purchase order.',
            ],
            [
                'code' => 'closed',
                'name' => 'Closed',
                'description' => 'Closed purchase order.',
            ],
        ];

        foreach ($purchaseOrderStatuses as $purchaseOrderStatus) {
            $existingPurchaseOrderStatus = PurchaseOrderStatus::where('code', '=', $purchaseOrderStatus['code'])->first();
            if (!$existingPurchaseOrderStatus) {
                PurchaseOrderStatus::create($purchaseOrderStatus);
            }
        }
    }
}

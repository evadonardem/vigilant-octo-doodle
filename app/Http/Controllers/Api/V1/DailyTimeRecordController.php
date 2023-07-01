<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\DeliveryService;
use Carbon\Carbon;
use Dingo\Api\Routing\Helpers;
use App\Models\User;
use App\Models\Delivery;
use App\Models\OvertimeRate;

class DailyTimeRecordController extends Controller
{
    use Helpers;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $request->only([
            'biometric_id',
            'start_date',
            'end_date',
            'include_deliveries_from_purchase_orders',
        ]);

        $biometricId = $request->input('biometric_id');
        $startDate = Carbon::createFromFormat('Y-m-d', $request->input('start_date'));
        $endDate = Carbon::createFromFormat('Y-m-d', $request->input('end_date'));
        $includeDeliveriesFromPurchaseOrders = $request->input('include_deliveries_from_purchase_orders');

        // fetch deliveries (trips) from closed purchase orders
        $deliveryService = resolve(DeliveryService::class);
        $deliveriesFromPurchaseOrders = $includeDeliveriesFromPurchaseOrders
            ? $deliveryService->getAllTripsByPeriod($startDate->format('Y-m-d'), $endDate->format('Y-m-d')) : [];

        $meta = [
            'from' => $startDate->format('d M Y'),
            'to' => $endDate->format('d M Y'),
            'duration_total_hours' => 0,
        ];
        $dailyTimeRecord = [];

        while ($startDate <= $endDate) {
            $logs = $this->api->get('biometric/attendance-logs', [
                'biometric_id' => $biometricId,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $startDate->format('Y-m-d'),
            ]);
            $data = $logs['data'];

            foreach ($data as $log) {
                $user = User::where('biometric_id', $log['biometric_id'])->first();

                if (!$user) {
                    continue;
                }

                $logDate = Carbon::createFromFormat('Y-m-d H:i:s', $log['biometric_timestamp']);
                if (array_key_exists($user->biometric_id, $dailyTimeRecord)) {
                    if (
                        array_key_exists(
                            $logDate->format('Y-m-d'),
                            $dailyTimeRecord[$user->biometric_id]['logs']
                        )
                    ) {
                        $dailyTimeRecord[$user->biometric_id]['logs'][$logDate->format('Y-m-d')][]
                            = $log['biometric_timestamp'];
                    } else {
                        $dailyTimeRecord[$user->biometric_id]['logs'][$logDate->format('Y-m-d')]
                            = [$log['biometric_timestamp']];
                    }
                } else {
                    $perHourRateAmount = $user->rates()
                        ->whereHas('type', function ($query) {
                            $query->where('code', 'per_hour');
                        })
                        ->where(
                            'effectivity_date',
                            '<=',
                            $startDate->format('Y-m-d')
                        )
                        ->orderBy('effectivity_date', 'desc')
                        ->first();
                    if (!$perHourRateAmount) {
                        $perHourRateAmount = $user->rates()
                            ->whereHas('type', function ($query) {
                                $query->where('code', 'per_hour');
                            })
                            ->orderBy('effectivity_date', 'desc')
                            ->first();
                    }

                    $perDeliveryRateAmount = $user->rates()
                        ->whereHas('type', function ($query) {
                            $query->where('code', 'per_delivery');
                        })
                        ->where(
                            'effectivity_date',
                            '<=',
                            $startDate->format('Y-m-d')
                        )
                        ->orderBy('effectivity_date', 'desc')
                        ->first();
                    if (!$perDeliveryRateAmount) {
                        $perDeliveryRateAmount = $user->rates()
                            ->whereHas('type', function ($query) {
                                $query->where('code', 'per_delivery');
                            })
                            ->orderBy('effectivity_date', 'desc')
                            ->first();
                    }

                    $dailyTimeRecord[$log['biometric_id']] = [
                        'biometric_id' => $user->biometric_id,
                        'biometric_name' => $user->name,
                        'effective_per_hour_rate' => $perHourRateAmount
                            ? $perHourRateAmount->amount : '0.00',
                        'effective_per_delivery_rate' => $perDeliveryRateAmount
                            ? $perDeliveryRateAmount->amount : '0.00',
                        'logs' => [
                            $logDate->format('Y-m-d') => [$log['biometric_timestamp']],
                        ],
                    ];
                }
            }

            $startDate->addDay();
        }

        // Create placeholders for DTRs having deliveries ONLY
        $startDate = Carbon::createFromFormat('Y-m-d', $request->input('start_date'));
        if ($biometricId) {
            $deliveries = Delivery::
                whereHas('user', function ($query) use ($biometricId) {
                    $query->where('biometric_id', $biometricId);
                })
                ->whereBetween(
                    'delivery_date',
                    [
                        $startDate->format('Y-m-d'),
                        $endDate->format('Y-m-d')
                    ]
                )
                ->get();
        } else {
            $deliveries = Delivery::
                whereBetween(
                    'delivery_date',
                    [
                        $startDate->format('Y-m-d'),
                        $endDate->format('Y-m-d')
                    ]
                )
                ->get();
        }

        foreach ($deliveries as $delivery) {
            if (!array_key_exists($delivery->user->biometric_id, $dailyTimeRecord)) {
                $perDeliveryRateAmount = $delivery->user->rates()
                    ->whereHas('type', function ($query) {
                        $query->where('code', 'per_delivery');
                    })
                    ->where(
                        'effectivity_date',
                        '<=',
                        $delivery->delivery_date
                    )
                    ->orderBy('effectivity_date', 'desc')
                    ->first();
                if (!$perDeliveryRateAmount) {
                    $perDeliveryRateAmount = $delivery->user->rates()
                        ->whereHas('type', function ($query) {
                            $query->where('code', 'per_delivery');
                        })
                        ->orderBy('effectivity_date', 'desc')
                        ->first();
                }
                $dailyTimeRecord[$delivery->user->biometric_id] = [
                    'biometric_id' => $delivery->user->biometric_id,
                    'biometric_name' => $delivery->user->name,
                    'effective_per_hour_rate' => 0,
                    'effective_per_delivery_rate' => $perDeliveryRateAmount
                        ? $perDeliveryRateAmount->amount : 0,
                    'logs' => [
                        $delivery->delivery_date => []
                    ],
                ];
            } else {
                if (
                    !array_key_exists(
                        $delivery->delivery_date,
                        $dailyTimeRecord[$delivery->user->biometric_id]['logs']
                    )
                ) {
                    $dailyTimeRecord[$delivery->user->biometric_id]['logs'][$delivery->delivery_date] = [];
                }
            }
        }

        // register daily time record placeholders for deliveries from purchase orders
        foreach ($deliveriesFromPurchaseOrders as $biometricId => $details) {
            $deliveries = $details['deliveries'];

            foreach ($deliveries as $coverageDate => $deliveryDetails) {
                if (array_key_exists($biometricId, $dailyTimeRecord)) {
                    if (
                        !array_key_exists(
                            $coverageDate,
                            $dailyTimeRecord[$biometricId]['logs']
                        )
                    ) {
                        $dailyTimeRecord[$biometricId]['logs'][$coverageDate] = [];
                    }
                } else {
                    $dailyTimeRecord[$biometricId] = [
                        'biometric_id' => $biometricId,
                        'biometric_name' => $details['name'],
                        'effective_per_hour_rate' => 0,
                        'effective_per_delivery_rate' => $deliveryDetails->effective_per_delivery_rate,
                        'logs' => [
                            $coverageDate => []
                        ],
                    ];
                }
            }
        }

        $dailyTimeRecord = array_values($dailyTimeRecord);

        foreach ($dailyTimeRecord as &$details) {
            $user = User::where('biometric_id', $details['biometric_id'])->first();
            $meta['duration_total_hours'] = 0;
            $meta['duration_total_hours_overtime'] = 0;
            $meta['duration_total_hours_amount'] = 0;
            $meta['duration_total_hours_amount_overtime'] = 0;
            $meta['duration_total_hours_amount_with_overtime'] = 0;
            $meta['duration_total_deliveries'] = 0;
            $meta['duration_total_deliveries_amount'] = 0;

            ksort($details['logs']);

            foreach ($details['logs'] as $key => &$logs) {
                $date = Carbon::createFromFormat('Y-m-d', $key);
                $entries = [];
                $timeInOut = [];
                for ($i = 0; $i < count($logs); $i += 2, $timeInOut = []) {
                    $timeInOut['in'] = Carbon::createFromFormat('Y-m-d H:i:s', $logs[$i])
                        ->format('h:i:s A');

                    $timeInOut['per_hour_rate_amount'] = 0;
                    if (array_key_exists($i + 1, $logs)) {
                        $timeInOut['out'] = Carbon::createFromFormat('Y-m-d H:i:s', $logs[$i + 1])
                            ->format('h:i:s A');

                        /*
                         * Fetch in effect per hour rate amount based on log time-out date,
                         * if did not matched any pick the first entry from rates.
                         */
                        $perHourRateAmount = $user->rates()
                            ->whereHas('type', function ($query) {
                                $query->where('code', 'per_hour');
                            })
                            ->where(
                                'effectivity_date',
                                '<=',
                                Carbon::createFromFormat('Y-m-d H:i:s', $logs[$i + 1])->format('Y-m-d')
                            )
                            ->orderBy('effectivity_date', 'desc')
                            ->first();
                        if (!$perHourRateAmount) {
                            $perHourRateAmount = $user->rates()
                                ->whereHas('type', function ($query) {
                                    $query->where('code', 'per_hour');
                                })
                                ->orderBy('effectivity_date', 'desc')
                                ->first();
                        }

                        $timeInOut['per_hour_rate_amount'] = $perHourRateAmount ? $perHourRateAmount->amount : 0;

                        $timeInOut['per_hour_rate_amount_overtime'] = 0;
                        if ($perHourRateAmount) {
                            $overtimeRate = OvertimeRate::whereHas('type', function ($query) {
                                $query->where('code', 'normal_day');
                            })
                            ->where(
                                'effectivity_date',
                                '<=',
                                Carbon::createFromFormat('Y-m-d H:i:s', $logs[$i + 1])->format('Y-m-d')
                            )
                            ->orderBy('effectivity_date', 'desc')
                            ->first();
                            $timeInOut['per_hour_rate_amount_overtime'] = $overtimeRate
                                ? $perHourRateAmount->amount * $overtimeRate->non_night_shift
                                : $perHourRateAmount->amount;
                        }
                    }
                    $entries[] = $timeInOut;
                }

                $totalSeconds = 0;
                $totalSecondsOvertime = 0;

                $totalAmount = 0;
                $totalAmountOvertime = 0;

                foreach ($entries as &$entry) {
                    $entry['hours'] = 0;
                    $entry['hours_overtime'] = 0;
                    $entry['amount'] = 0;
                    $netry['amount_overtime'] = 0;
                    if (
                        array_key_exists('in', $entry) &&
                        array_key_exists('out', $entry)
                    ) {
                        $timeIn = Carbon::createFromFormat('h:i:s A', $entry['in']);
                        $timeOut = Carbon::createFromFormat('h:i:s A', $entry['out']);
                        $entrySeconds = $timeOut->diffInSeconds($timeIn);

                        $isOvertime = false;
                        $entrySecondsOvertimeInitial = 0;
                        if (
                            $totalSeconds < 28800 &&
                            $totalSecondsOvertime == 0 &&
                            $totalSeconds + $entrySeconds > 28800
                        ) {
                            $entrySecondsOvertimeInitial = $totalSeconds + $entrySeconds - 28800;
                            $entrySeconds -= $entrySecondsOvertimeInitial;
                            $totalSeconds += $entrySeconds;

                            $totalSecondsOvertime += $entrySecondsOvertimeInitial;
                            $entryHoursOvertimeInitial = number_format(round($entrySecondsOvertimeInitial / 60 / 60, 3), 3, '.', '');
                            $entryAmountOvertimeInitial = number_format(round($entryHoursOvertimeInitial * $entry['per_hour_rate_amount_overtime'], 2), 2, '.', '');

                            $entry['hours_overtime'] = $entryHoursOvertimeInitial;
                            $entry['amount_overtime'] = $entryAmountOvertimeInitial;

                            $totalAmountOvertime += $entryAmountOvertimeInitial;
                        } else {
                            $isOvertime = ($totalSecondsOvertime > 0);
                            if ($isOvertime) {
                                $totalSecondsOvertime += $entrySeconds;
                            } else {
                                $totalSeconds += $entrySeconds;
                            }
                        }

                        $appliedPerHourRateAmount = $isOvertime
                            ? $entry['per_hour_rate_amount_overtime']
                            : $entry['per_hour_rate_amount'];

                        $entryHours = number_format(round($entrySeconds / 60 / 60, 3), 3, '.', '');
                        $entryAmount = number_format(round($entryHours * $appliedPerHourRateAmount, 2), 2, '.', '');

                        $entry[$isOvertime ? 'hours_overtime' : 'hours'] = $entryHours;
                        $entry[$isOvertime ? 'amount_overtime' : 'amount'] = $entryAmount;

                        if ($isOvertime) {
                            $totalAmountOvertime += $entryAmount;
                            $totalAmountOvertime = number_format(round($totalAmountOvertime, 2), 2, '.', '');
                        } else {
                            $totalAmount += $entryAmount;
                            $totalAmount = number_format(round($totalAmount, 2), 2, '.', '');
                        }
                    }

                    unset($entry);
                }
                $totalInHours = number_format(round($totalSeconds / 60 / 60, 3), 3, '.', '');
                $totalInHoursOvetime = number_format(round($totalSecondsOvertime / 60 / 60, 3), 3, '.', '');

                $delivery = $user->deliveries()->where('delivery_date', $date->format('Y-m-d'))->first();
                $perDeliveryRateAmount = $user->rates()
                    ->whereHas('type', function ($query) {
                        $query->where('code', 'per_delivery');
                    })
                    ->where(
                        'effectivity_date',
                        '<=',
                        $date->format('Y-m-d')
                    )
                    ->orderBy('effectivity_date', 'desc')
                    ->first();
                if (!$perDeliveryRateAmount) {
                    $perDeliveryRateAmount = $user->rates()
                        ->whereHas('type', function ($query) {
                            $query->where('code', 'per_delivery');
                        })
                        ->orderBy('effectivity_date', 'desc')
                        ->first();
                }
                $totalDeliveries = $delivery ? $delivery->no_of_deliveries : 0;

                $deliveryFromPO = $deliveriesFromPurchaseOrders[$user->biometric_id] ?? null;
                if ($deliveryFromPO && array_key_exists($date->format('Y-m-d'), $deliveryFromPO['deliveries'])) {
                    $totalDeliveries += $deliveryFromPO['deliveries'][$date->format('Y-m-d')]->no_of_deliveries;
                }

                $totalDeliveriesAmount  = $totalDeliveries * ($perDeliveryRateAmount ? $perDeliveryRateAmount->amount : 0);

                $meta['duration_total_hours'] += $totalInHours;
                $meta['duration_total_hours_overtime'] += $totalInHoursOvetime;
                $meta['duration_total_hours_amount'] += $totalAmount;
                $meta['duration_total_hours_amount_overtime'] += $totalAmountOvertime;
                $meta['duration_total_hours_amount_with_overtime'] += $totalAmount + $totalAmountOvertime;
                $meta['duration_total_deliveries'] += $totalDeliveries;
                $meta['duration_total_deliveries_amount'] += $totalDeliveriesAmount;
                $logs = [
                    'date' => !is_null($date) ? $date->format('D, M d, Y') : null,
                    'time_in_out' => $entries,
                    'total_hours' => $totalInHours,
                    'total_hours_overtime' => $totalInHoursOvetime,
                    'total_amount' => $totalAmount,
                    'total_amount_overtime' => $totalAmountOvertime,
                    'total_deliveries' => $totalDeliveries,
                    'total_deliveries_amount' => $totalDeliveriesAmount,
                    'remarks' => $delivery ? $delivery->remarks : '',
                ];

                unset($logs);
            }
            $meta['duration_total_deliveries_amount'] = number_format($meta['duration_total_deliveries_amount'], 2, '.', '');
            $meta['duration_total_hours'] = number_format(round($meta['duration_total_hours'], 3), 3, '.', '');
            $meta['duration_total_hours_amount'] = number_format(round($meta['duration_total_hours_amount'], 2), 2, '.', '');
            $meta['duration_total_hours_overtime'] = number_format(round($meta['duration_total_hours_overtime'], 3), 3, '.', '');
            $meta['duration_total_hours_amount_overtime'] = number_format(round($meta['duration_total_hours_amount_overtime'], 2), 2, '.', '');
            $meta['duration_total_hours_amount_with_overtime'] = number_format(round($meta['duration_total_hours_amount_with_overtime'], 2), 2, '.', '');
            $details['logs'] = array_values($details['logs']);
            $details['meta'] = $meta;
            unset($details);
        }

        return response()->json(['data' => $dailyTimeRecord]);
    }
}

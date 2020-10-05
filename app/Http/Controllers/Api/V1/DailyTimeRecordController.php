<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Dingo\Api\Routing\Helpers;
use App\User;

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
        ]);

        $biometricId = $request->input('biometric_id');
        $startDate = Carbon::createFromFormat('Y-m-d', $request->input('start_date'));
        $endDate = Carbon::createFromFormat('Y-m-d', $request->input('end_date'));
        
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
                    $dailyTimeRecord[$log['biometric_id']] = [
                        'biometric_id' => $user->biometric_id,
                        'biometric_name' => $user->name,
                        'position' => $user->roles()
                            ->orderBy('created_at', 'desc')
                            ->first()
                            ->id,
                        'logs' => [
                            $logDate->format('Y-m-d') => [$log['biometric_timestamp']],
                        ],
                    ];
                }
            }

            $startDate->addDay();
        }

        $dailyTimeRecord = array_values($dailyTimeRecord);
        foreach ($dailyTimeRecord as &$details) {
            $user = User::where('biometric_id', $details['biometric_id'])->first();
            $meta['duration_total_hours'] = 0;
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
                            ->where('created_at', '<=', $logs[$i + 1])
                            ->orderBy('created_at', 'desc')
                            ->first();
                        if (!$perHourRateAmount) {
                            $perHourRateAmount = $user->rates()
                                ->orderBy('created_at', 'asc')
                                ->first();
                        }
                        
                        $timeInOut['per_hour_rate_amount'] = $perHourRateAmount->amount;
                    }
                    $entries[] = $timeInOut;
                }

                $totalSeconds = 0;
                $totalAmount = 0;
                foreach ($entries as &$entry) {
                    $entry['hours'] = 0;
                    $entry['amount'] = 0;
                    if (
                        array_key_exists('in', $entry) &&
                        array_key_exists('out', $entry)
                    ) {
                        $timeIn = Carbon::createFromFormat('h:i:s A', $entry['in']);
                        $timeOut = Carbon::createFromFormat('h:i:s A', $entry['out']);
                        $entrySeconds = $timeOut->diffInSeconds($timeIn);
                        $entryHours = round($entrySeconds / 60 / 60, 3);
                        $entryAmount = round($entryHours * $entry['per_hour_rate_amount'], 2);
                        $totalSeconds += $entrySeconds;
                        $totalAmount += $entryAmount;
                        $entry['hours'] = $entryHours;
                        $entry['amount'] = $entryAmount;
                    }

                    unset($entry);
                }
                $totalInHours = round($totalSeconds / 60 / 60, 3);
                $meta['duration_total_hours'] += $totalInHours;
                
                $logs = [                
                    'date' => !is_null($date) ? $date->format('D, M d, Y') : null,
                    'time_in_out' => $entries,
                    'total_hours' => $totalInHours,
                    'total_amount' => $totalAmount,
                    'deliveries' => 0,
                ];

                unset($logs);
            }
            $meta['duration_total_hours'] = round($meta['duration_total_hours'], 3);
            $details['logs'] = array_values($details['logs']);
            $details['meta'] = $meta;
            unset($details);
        }

        return response()->json(['data' => $dailyTimeRecord]);
    }
}

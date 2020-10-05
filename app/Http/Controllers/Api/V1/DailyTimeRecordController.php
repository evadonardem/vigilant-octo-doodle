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
            $meta['duration_total_hours'] = 0;
            foreach ($details['logs'] as $key => &$logs) {
                $date = Carbon::createFromFormat('Y-m-d', $key);
                $entries = [];
                $timeInOut = [];
                for ($i = 0; $i < count($logs); $i += 2, $timeInOut = []) {
                    $timeInOut[] = Carbon::createFromFormat('Y-m-d H:i:s', $logs[$i])
                        ->format('h:i:s A');
                    if (array_key_exists($i + 1, $logs)) {
                        $timeInOut[] = Carbon::createFromFormat('Y-m-d H:i:s', $logs[$i + 1])
                            ->format('h:i:s A');
                    }
                    $entries[] = $timeInOut;
                }

                $totalSeconds = 0;
                foreach ($entries as $entry) {
                    if (count($entry) == 2) {
                        $timeIn = Carbon::createFromFormat('h:i:s A', $entry[0]);
                        $timeOut = Carbon::createFromFormat('h:i:s A', $entry[1]);
                        $totalSeconds += $timeOut->diffInSeconds($timeIn);
                    }
                }
                $totalInHours = round($totalSeconds / 60 / 60, 3);
                $meta['duration_total_hours'] += $totalInHours;
                
                $logs = [
                    'full_date' => !is_null($date) ? $date->format('Y-m-d') : null,
                    'short_date' => !is_null($date) ? $date->format('d D') : null,
                    'time_in_out' => $entries,
                    'total_hours' => $totalInHours,
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

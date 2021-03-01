<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AttendanceLog;
use App\Models\Delivery;
use App\Models\Rate;
use App\Models\RateType;

class ManualLogController extends Controller
{
     /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $attributes = $request->only([
            'type',
            'biometric_id',
            'log_datetime',
            'log_date',
            'no_of_deliveries',
            'remarks'
        ]);

        if ($attributes['type'] == 'biometric_log') {
            AttendanceLog::create([
                'biometric_id' => $attributes['biometric_id'],
                'biometric_name' => "#OVERRIDE#",
                'biometric_timestamp' => $attributes['log_datetime'],
            ]);
        } else {
            if ($attributes['type'] == 'delivery_log') {
                $user = User::where('biometric_id', $attributes['biometric_id'])->first();
                Delivery::create([
                    'user_id' => $user->id,
                    'delivery_date' => $attributes['log_date'],
                    'no_of_deliveries' => $attributes['no_of_deliveries'],
                    'remarks' => $attributes['remarks'],
                ]);
            }
        }

        return response()->noContent();
    }
}

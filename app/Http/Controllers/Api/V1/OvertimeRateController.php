<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOvertimeRateRequest;
use App\Models\OvertimeRate;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class OvertimeRateController extends Controller
{
    use Helpers;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $overtimeRates = OvertimeRate::orderBy('effectivity_date', 'desc')->paginate($perPage);
        $overtimeRates->each(function ($overtimeRate) {
            $overtimeRate->type;
        });

        return response()->json($overtimeRates);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreOvertimeRateRequest $request)
    {
        $attributes = $request->only([
            'effectivity_date',
            'overtime_rate_type_id',
            'non_night_shift',
            'night_shift'
        ]);
        $attributes['non_night_shift'] /= 100;
        $attributes['night_shift'] /= 100;

        OvertimeRate::create($attributes);

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\OvertimeRate  $overtimeRate
     * @return \Illuminate\Http\Response
     */
    public function destroy(OvertimeRate $overtimeRate)
    {
        $overtimeRate->delete();

        return response()->noContent();
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\ThirteenthMonth;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class ThirteenthMonthController extends Controller
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

        $thirteenthMonthPayPeriods = ThirteenthMonth::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->paginate($perPage);

        return response()->json($thirteenthMonthPayPeriods);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $attributes = $request->only([
            'from',
            'to',
        ]);

        $startDate = Carbon::createFromFormat('Y-m', $attributes['from']);
        $endDate = Carbon::createFromFormat('Y-m', $attributes['to']);

        ThirteenthMonth::create([
            'from' => $startDate->startOfMonth()->format('Y-m-d'),
            'to' => $endDate->endOfMonth()->format('Y-m-d')
        ]);

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  int $payPeriodId
     * @return \Illuminate\Http\Response
     */
    public function show(int $payPeriodId)
    {
        $payPeriod = ThirteenthMonth::findOrFail($payPeriodId);

        return response()->json(['data' => $payPeriod]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\ThirteenthMonth  $thirteenthMonth
     * @return \Illuminate\Http\Response
     */
    public function edit(ThirteenthMonth $thirteenthMonth)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\ThirteenthMonth  $thirteenthMonth
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ThirteenthMonth $thirteenthMonth)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(int $id)
    {
        ThirteenthMonth::findOrFail($id)->delete();

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param int $payPeriodId
     * @return \Illuminate\Http\Response
     */
    public function showThirteenthMonthPayPeriodDetails(Request $request, $payPeriodId)
    {
        set_time_limit(0);

        $payPeriod = ThirteenthMonth::findOrFail($payPeriodId);

        $startDate = Carbon::createFromFormat('Y-m-d', $payPeriod->from);
        $endDate = Carbon::createFromFormat('Y-m-d', $payPeriod->to);

        $logs = $this->api->get('daily-time-record', [
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
        ]);
        $data = $logs['data'];

        foreach ($data as &$r) {
            $durationTotalGrossAmountWithoutOvertime = $r['meta']['duration_total_hours_amount'] + $r['meta']['duration_total_deliveries_amount'];
            $durationThirteenthMonthPay = $durationTotalGrossAmountWithoutOvertime / 12;
            $r['meta']['duration_total_gross_amount_without_overtime'] = number_format($durationTotalGrossAmountWithoutOvertime, 2, '.', '');
            $r['meta']['duration_thirteenth_month_pay'] = number_format($durationThirteenthMonthPay, 2, '.', '');
            unset($r);
        }

        return response()->json(['data' => $data]);
    }
}

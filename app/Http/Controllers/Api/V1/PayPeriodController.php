<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PayPeriod;
use App\Models\PayPeriodDeduction;
use App\Models\PayPeriodCommonDeduction;
use App\Models\DeductionType;
use Carbon\Carbon;
use Dingo\Api\Routing\Helpers;

class PayPeriodController extends Controller
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

        $payPeriods = PayPeriod::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->paginate($perPage);

        return response()->json($payPeriods);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $payPeriodId)
    {
        $payPeriod = PayPeriod::findOrFail($payPeriodId);
        $payPeriod->commonDeductions;

        return response()->json(['data' => $payPeriod]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function showPayPeriodDetails(Request $request, $payPeriodId)
    {
        $payPeriod = PayPeriod::findOrFail($payPeriodId);
        $payPeriod->commonDeductions;

        $startDate = Carbon::createFromFormat('Y-m-d', $payPeriod->from);
        $endDate = Carbon::createFromFormat('Y-m-d', $payPeriod->to);

        $logs = $this->api->get('daily-time-record', [
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
        ]);
        $data = $logs['data'];

        foreach ($data as &$r) {
            $user = User::where('biometric_id', $r['biometric_id'])->first();
            $r['meta']['duration_total_gross_amount'] = $r['meta']['duration_total_hours_amount_with_overtime'] +
                $r['meta']['duration_total_deliveries_amount'];
            $r['deductions'] = $user->payPeriodDeductions()
                ->where('pay_period_id', $payPeriod->id)
                ->get();
            $r['meta']['duration_total_deductions_amount'] = 0;
            foreach ($r['deductions'] as $deduction) {
                $deduction->deductionType;
                $deduction->amount = number_format(round($deduction->amount, 2), 2, '.', '');
                $r['meta']['duration_total_deductions_amount'] += $deduction->amount;
            }
            $r['meta']['duration_total_gross_amount'] = number_format($r['meta']['duration_total_gross_amount'], 2, '.', '');
            $r['meta']['duration_total_deductions_amount'] = number_format(round($r['meta']['duration_total_deductions_amount'], 2), 2, '.', '');
            $r['meta']['duration_total_net_amount'] = number_format(round(
                $r['meta']['duration_total_gross_amount'] - $r['meta']['duration_total_deductions_amount'],
                2
            ), 2, '.', '');
            unset($r);
        }

        return response()->json(['data' => $data]);
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

        PayPeriod::create([
            'from' => $attributes['from'],
            'to' => $attributes['to']
        ]);

        return response()->noContent();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeCommonDeductions(Request $request, $payPeriodId)
    {
        $payPeriod = PayPeriod::findOrFail($payPeriodId);
        $deductionTypes = DeductionType::all();
        $onlyAttributes = [];
        foreach ($deductionTypes as $deductionType) {
            $onlyAttributes[] = $deductionType->code . '_amount';
        }
        $attributes = $request->only($onlyAttributes);

        foreach ($deductionTypes as $deductionType) {
            if (array_key_exists($deductionType->code . '_amount', $attributes)) {
               $payPeriod->commonDeductions()->save(PayPeriodCommonDeduction::make([
                   'deduction_type_id' => $deductionType->id,
                   'default_amount' => $attributes[$deductionType->code . '_amount'],
               ]));
            }
        }

        $startDate = Carbon::createFromFormat('Y-m-d', $payPeriod->from);
        $endDate = Carbon::createFromFormat('Y-m-d', $payPeriod->to);

        $logs = $this->api->get('daily-time-record', [
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
        ]);
        $data = $logs['data'];

        $biometricIds = array_unique(array_column($data, 'biometric_id'));
        foreach ($biometricIds as $biometricId) {
            $user = User::where('biometric_id', $biometricId)->first();
            foreach ($payPeriod->commonDeductions as $commonDeduction) {
                $user->payPeriodDeductions()->save(PayPeriodDeduction::make([
                    'pay_period_id' => $payPeriod->id,
                    'deduction_type_id' => $commonDeduction->deduction_type_id,
                    'amount' => $commonDeduction->default_amount,
                ]));
            }
        }

        return response()->noContent();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateUserPayPeriodDeductions(Request $request)
    {
        $attributes = $request->only(['biometric_id', 'pay_period_id']);
        $user = User::where('biometric_id', $attributes['biometric_id'])->first();
        $payPeriodDeductions = $user->payPeriodDeductions()
            ->where('pay_period_id', $attributes['pay_period_id'])
            ->get();

        $onlyAttributes = [];
        foreach ($payPeriodDeductions as $payPeriodDeduction) {
            $onlyAttributes[] = 'amount_' . $payPeriodDeduction->id;
        }
        $attributes = $request->only($onlyAttributes);

        foreach ($attributes as $key => $value) {
            $payPeriodDeductionId = str_replace('amount_', '', $key);
            $payPeriodDeduction = PayPeriodDeduction::where('id', $payPeriodDeductionId)->first();
            if ($payPeriodDeduction) {
                $payPeriodDeduction->amount = $value;
                $payPeriodDeduction->save();
            }
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        PayPeriod::findOrFail($id)->delete();

        return response()->noContent();
    }
}

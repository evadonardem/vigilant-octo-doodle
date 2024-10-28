<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GetPromodisersSummaryRequest;
use App\Http\Resources\PromodiserResource;
use App\Services\PromodiserService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PromodisersSummaryController extends Controller
{
    public function __construct(
        private PromodiserService $service
    ) {
        $this->middleware('can:Generate promodisers summary report')->only('index');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(GetPromodisersSummaryRequest $request)
    {
        $filterBy = $request->input('filters.instance_type') ?? '';
        $instanceId = $request->input('filters.instance_id') ?? 0;
        $paymentType = $request->input('filters.payment_type') ?? '';
        $paymentSchedule = Carbon::parse($request->input('filters.payment_year_month')) ?? null;
        $paymentFrom = $paymentSchedule ? $paymentSchedule->startOfMonth()->format('Y-m-d') : null;
        $paymentTo = $paymentSchedule ? $paymentSchedule->endOfMonth()->format('Y-m-d') : null;

        $promodisers = $this->service->getAllActivePromodisers($filterBy, $instanceId, $paymentType, $paymentFrom, $paymentTo);
        return PromodiserResource::collection($promodisers);
    }
}

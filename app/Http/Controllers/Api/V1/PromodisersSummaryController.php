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
    ) {}

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
        $paymentSchedule = Carbon::parse($request->input('filters.payment_year_month'))->endOfMonth()->format('Y-m-d')  ?? '';

        $promodisers = $this->service->getAllActivePromodisers($filterBy, $instanceId, $paymentType, $paymentSchedule);
        return PromodiserResource::collection($promodisers);
    }
}

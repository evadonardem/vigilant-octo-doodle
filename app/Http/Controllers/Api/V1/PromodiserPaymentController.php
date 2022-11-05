<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromodiserPaymentRequest;
use App\Models\Promodiser;
use App\Services\PromodiserPaymentService;
use Carbon\Carbon;

class PromodiserPaymentController extends Controller
{
    public function __construct(
        private PromodiserPaymentService $service
    )
    {

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StorePromodiserPaymentRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePromodiserPaymentRequest $request, Promodiser $promodiser)
    {
        $paymentSchedule = Carbon::parse($request->input('data.payment_year_month'));
        $from = $paymentSchedule->startOfMonth()->format('Y-m-d');
        $to = $paymentSchedule->endOfMonth()->format('Y-m-d');

        return $this->service->addPromodiserPayment($promodiser, $from, $to) ? response()->noContent() : abort(422);
    }
}

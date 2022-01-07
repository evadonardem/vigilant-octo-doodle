<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJobContractRequest;
use App\Http\Requests\UpdateJobContractRequest;
use App\Models\JobContract;
use App\Models\Promodiser;
use App\Models\Store;
use Carbon\Carbon;	

class StorePromodiserJobContractController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Store $store, Promodiser $promodiser)
    {
        return response()->json([
            'data' => $promodiser->jobContracts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreJobContractRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreJobContractRequest $request, Store $store, Promodiser $promodiser)
    {
    				$attributes = $request->input('data.attributes');    				
    				$promodiser->jobContracts()->create($attributes);
    				
        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\JobContract  $jobContract
     * @return \Illuminate\Http\Response
     */
    public function show(JobContract $jobContract)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\JobContract  $jobContract
     * @return \Illuminate\Http\Response
     */
    public function edit(JobContract $jobContract)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateJobContractRequest  $request
     * @param  \App\Models\JobContract  $jobContract
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateJobContractRequest $request, JobContract $jobContract)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\JobContract  $jobContract
     * @return \Illuminate\Http\Response
     */
    public function destroy(JobContract $jobContract)
    {
        //
    }
}

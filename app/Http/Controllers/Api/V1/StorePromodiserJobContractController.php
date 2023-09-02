<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJobContractRequest;
use App\Http\Requests\UpdateJobContractRequest;
use App\Models\JobContract;
use App\Models\Promodiser;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class StorePromodiserJobContractController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, Store $store, Promodiser $promodiser)
    {
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $jobContracts = JobContract::where('promodiser_id', '=', $promodiser->id)
            ->orderByRaw('end_date IS NULL DESC')
            ->orderBy('start_date', 'desc')
            ->orderBy('end_date', 'desc')
            ->paginate($perPage);

        return response()->json($jobContracts);
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
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateJobContractRequest  $request
     * @param  \App\Models\JobContract  $jobContract
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateJobContractRequest $request, Store $store, Promodiser $promodiser, JobContract $jobContract)
    {
        $attributes = $request->input('data.attributes');
        $jobContract->fill($attributes);
        $jobContract->save();

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\JobContract  $jobContract
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, Store $store, Promodiser $promodiser, JobContract $jobContract)
    {

        if ($jobContract->promodiser->id === $promodiser->id && $jobContract->promodiser->store->id === $store->id) {
            $jobContract->delete();
            return response()->noContent();
        }

        return abort(400);
    }
}

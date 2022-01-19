<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Promodiser;
use Carbon\Carbon;

class PromodisersSummaryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $promodisers = Promodiser::whereHas('jobContracts', function ($query) {
            $query
                ->where(function ($query) {
                    $query
                        ->whereDate('start_date', '<=', Carbon::now()->format('Y-m-d'))
                        ->whereNull('end_date');
                })               
                ->orwhere(function ($query) {
                    $query
                        ->where('start_date', '<=', Carbon::now()->format('Y-m-d'))
                        ->where('end_date', '>=', Carbon::now()->format('Y-m-d'))
                        ->whereNotNull('end_date');
                });
        })
            ->with(['jobContracts' => function ($query) {
                $query
                    ->where(function ($query) {
                        $query
                            ->where('start_date', '<=', Carbon::now()->format('Y-m-d'))
                            ->whereNull('end_date');
                    })
                    ->orWhere(function ($query) {
                        $query
                            ->where('start_date', '<=', Carbon::now()->format('Y-m-d'))
                            ->where('end_date', '>=', Carbon::now()->format('Y-m-d'))
                            ->whereNotNull('end_date');
                    });
            }])
            ->with('store.location')
            ->get();

        return response()->json(['data' => $promodisers]);
    }
}

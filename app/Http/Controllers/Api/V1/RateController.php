<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rate;
use App\Models\RateType;

class RateController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $userId)
    {
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;
        $filters = $request->input('filters');

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $user = User::find($userId);
        $rates = $user->rates()->orderBy('effectivity_date', 'desc')
            ->where('rate_type_id', $filters['rate_type_id'])
            ->paginate($perPage);

        return response()->json($rates);
    }

    /**
    * Store a newly created resource in storage.
    *
    * @param  \Illuminate\Http\Request  $request
    * @return \Illuminate\Http\Response
    */
    public function store(Request $request, $userId)
    {
        $attributes = $request->only([
            'type',
            'effectivity_date',
            'amount'
        ]);

        $user = User::find($userId);
        $rateType = RateType::where('code', $attributes['type'])->first();
        $rateAttributes = [
            'effectivity_date' => $attributes['effectivity_date'],
            'rate_type_id' => $rateType->id,
            'amount' => $attributes['amount'],
        ];
        $user->rates()->save(Rate::make($rateAttributes));

        return response()->noContent();
    }
}

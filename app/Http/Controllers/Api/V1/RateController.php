<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use App\Http\Controllers\Controller;
use App\User;

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
        $rates = $user->rates()->orderBy('created_at', 'desc')
            ->where('rate_type_id', $filters['rate_type_id'])
            ->paginate($perPage);

        return response()->json($rates);
    }
}

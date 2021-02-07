<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OvertimeRateType;

class OvertimeRateTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $overtimeRateTypes = OvertimeRateType::all();

        return response()->json(['data' => $overtimeRateTypes]);
    }
}

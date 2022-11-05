<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PromodiserResource;
use App\Services\PromodiserService;

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
    public function index()
    {
        $promodisers = $this->service->getAllActivePromodisers();
        return PromodiserResource::collection($promodisers);
    }
}

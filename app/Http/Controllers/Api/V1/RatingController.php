<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Rating;
use App\Http\Controllers\Controller;
use App\Http\Resources\RatingResource;
use App\Services\RatingService;

class RatingController extends Controller
{

    public function __construct(
        private RatingService $service
    ) {}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $allRatings = $this->service->getAllRatings();

        return RatingResource::collection($allRatings);
    }
}

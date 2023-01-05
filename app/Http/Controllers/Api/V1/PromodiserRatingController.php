<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Promodiser;
use App\Services\PromodiserService;
use Illuminate\Support\Facades\Log;

class PromodiserRatingController extends Controller
{
    public function __construct(
        private PromodiserService $promodiserService
    )
    {

    }

    public function store(Promodiser $promodiser)
    {
        $ratingId = (int)request()->input('data.rating_id');
        if ($this->promodiserService->ratePromodiser($promodiser, $ratingId)) {
            return response()->noContent();
        }
        return abort('422');
    }
}

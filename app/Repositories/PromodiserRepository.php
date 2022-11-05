<?php

namespace App\Repositories;

use App\Models\Promodiser;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\Log;

class PromodiserRepository
{
    public function __construct(
        private Promodiser $model
    ) {}

    public function getAllActivePromodisers(?string $filterBy, ?int $instanceId, ?string $paymentType, ?string $paymentSchedule)
    {
        $currentDate = Carbon::now('Asia/Manila')->format('Y-m-d');
        $queryAllActivePromodisers = $this->model
            ->whereHas(
                'jobContracts',
                function ($query) use ($currentDate) {
                    $query
                        ->where(function ($query) use ($currentDate) {
                            $query
                                ->whereDate('start_date', '<=', $currentDate)
                                ->whereNull('end_date');
                        })
                        ->orwhere(function ($query) use ($currentDate) {
                            $query
                                ->where('start_date', '<=', $currentDate)
                                ->where('end_date', '>=', $currentDate)
                                ->whereNotNull('end_date');
                        });
                }
            );

        if ($instanceId) {
            if ($filterBy === 'store') {
                $queryAllActivePromodisers->where('store_id', '=', $instanceId);
            } elseif ($filterBy === 'category') {
                $queryAllActivePromodisers->whereHas('store.category', function ($query) use ($instanceId) {
                    $query->where('id', '=', $instanceId);
                });
            } else {
                if ($filterBy === 'location') {
                    $queryAllActivePromodisers->whereHas('store.location', function ($query) use ($instanceId) {
                        $query->where('id', '=', $instanceId);
                    });
                }
            }
        }

        return $queryAllActivePromodisers->with(['jobContracts' => function ($query) use ($currentDate) {
                $query
                    ->where(function ($query) use ($currentDate) {
                        $query
                            ->where('start_date', '<=', $currentDate)
                            ->whereNull('end_date');
                    })
                    ->orWhere(function ($query) use ($currentDate) {
                        $query
                            ->where('start_date', '<=', $currentDate)
                            ->where('end_date', '>=', $currentDate)
                            ->whereNotNull('end_date');
                    });
            }])
            ->with('store.category')
            ->with('store.location')
            ->with('ratings')
            ->get()
            ->sortBy('name', SORT_FLAG_CASE)
            ->sortBy('store.name', SORT_FLAG_CASE)
            ->sortBy('store.location.name', SORT_FLAG_CASE)
            ->values();
    }

    public function savePromodiserRating(Promodiser $promodiser, int $ratingId)
    {
        try {
            $promodiser->ratings()->attach($ratingId);
        } catch (QueryExecuted | Exception $e) {
            Log::debug($e->getMessage());
            return false;
        }

        return true;
    }
}

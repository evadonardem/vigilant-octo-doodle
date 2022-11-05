<?php

namespace App\Repositories;

use App\Models\Promodiser;
use Carbon\Carbon;

class PromodiserRepository
{
    public function __construct(
        private Promodiser $model
    ) {}

    public function getAllActivePromodisers()
    {
        $currentDate = Carbon::now('Asia/Manila')->format('Y-m-d');
        return $this->model
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
            )
            ->with(['jobContracts' => function ($query) use ($currentDate) {
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
            ->with('store.location')
            ->get()
            ->sortBy('name', SORT_FLAG_CASE)
            ->sortBy('store.name', SORT_FLAG_CASE)
            ->sortBy('store.location.name', SORT_FLAG_CASE)
            ->values();
    }
}

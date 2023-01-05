<?php

namespace App\Repositories;

use App\Models\Rating;

class RatingRepository
{
    public function __construct(
        private Rating $model
    ) {}

    public function getAllRatings()
    {
        return $this->model->orderBy('score', 'desc')->get();
    }
}

<?php

namespace App\Services;

use App\Repositories\RatingRepository;

class RatingService
{

    public function __construct(
        private RatingRepository $repository
    ) {}

    public function getAllRatings()
    {
        return $this->repository->getAllRatings();
    }
}

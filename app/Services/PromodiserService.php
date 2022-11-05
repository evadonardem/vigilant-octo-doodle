<?php

namespace App\Services;

use App\Models\Promodiser;
use App\Repositories\PromodiserRepository;

class PromodiserService
{

    public function __construct(
        private PromodiserRepository $repository
    ) {}

    public function getAllActivePromodisers(?string $filterBy, ?int $instanceId, ?string $paymentType, ?string $paymentFrom, ?string $paymentTo)
    {
        $allActivePromodisers = $this->repository->getAllActivePromodisers($filterBy, $instanceId, $paymentType, $paymentFrom, $paymentTo);

        $allActivePromodisers->each(function ($promodiser) {
            $promodiser->currentJobContract = $promodiser->jobContracts->first();
        });

        return $allActivePromodisers;
    }

    public function ratePromodiser(Promodiser $promodiser, int $ratingId)
    {
        return $this->repository->savePromodiserRating($promodiser, $ratingId);
    }
}

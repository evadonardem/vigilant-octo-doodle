<?php

namespace App\Services;

use App\Repositories\PromodiserRepository;

class PromodiserService
{

    public function __construct(
        private PromodiserRepository $repository
    ) {}

    public function getAllActivePromodisers()
    {
        $allActivePromodisers = $this->repository->getAllActivePromodisers();

        $allActivePromodisers->each(function ($promodiser) {
            $promodiser->currentJobContract = $promodiser->jobContracts->first();
        });

        return $allActivePromodisers;
    }
}

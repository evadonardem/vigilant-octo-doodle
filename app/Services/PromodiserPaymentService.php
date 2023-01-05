<?php

namespace App\Services;

use App\Models\Promodiser;
use App\Repositories\PromodiserPaymentRepository;

class PromodiserPaymentService
{

    public function __construct(
        private PromodiserPaymentRepository $repository
    ) {}

    public function addPromodiserPayment(Promodiser $promodiser, string $from, string $to)
    {
        return $this->repository->savePromodiserPayment($promodiser->id, $from, $to);
    }
}

<?php

namespace App\Repositories;

use App\Models\PromodiserPayment;

class PromodiserPaymentRepository
{
    public function __construct(
        private PromodiserPayment $model
    ) {}

    public function savePromodiserPayment(int $promodiserId, string $from, string $to)
    {
        return $this->model->create([
            'promodiser_id' => $promodiserId,
            'from' => $from,
            'to' => $to,
        ]);
    }
}

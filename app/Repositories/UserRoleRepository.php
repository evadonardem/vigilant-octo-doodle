<?php

namespace App\Repositories;

use App\Models\User;

class UserRoleRepository
{
    public function __construct(
        private User $model
    ) {}

    public function getUserRoles(int $userId)
    {
        return $this->model->where('id', $userId)->first()?->roles;
    }
}

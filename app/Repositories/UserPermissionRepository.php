<?php

namespace App\Repositories;

use App\Models\User;

class UserPermissionRepository
{
    public function __construct(
        private User $model
    ) {}

    public function getUserPermissions(int $userId)
    {
        return $this->model->where('id', $userId)->first()?->permissions;
    }
}

<?php

namespace App\Repositories;

use Spatie\Permission\Models\Role;

class RoleRepository
{
    public function __construct(
        private Role $model
    ) {}

    public function getAllRoles()
    {
        return $this->model->where('name', '<>', 'Super Admin')->get();
    }
}

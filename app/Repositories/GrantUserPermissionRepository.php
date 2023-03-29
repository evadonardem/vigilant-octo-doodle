<?php

namespace App\Repositories;

use App\Models\User;

class GrantUserPermissionRepository
{
    public function setPermission(User $user, string $permission, bool $grant): void
    {
        if ($grant) {
            $user->givePermissionTo($permission);
        } else {
            $user->revokePermissionTo($permission);
        }
    }
}

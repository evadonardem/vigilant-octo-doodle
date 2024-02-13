<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Repositories\GrantUserPermissionRepository;

class GrantUserPermissionController extends Controller
{
    public function __construct(
        protected GrantUserPermissionRepository $grantUserPermissionRepository
    ) {
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(User $user)
    {
        $permission = request()->input('name');
        $grant = request()->input('has_permission');
        $this->grantUserPermissionRepository->setPermission($user, $permission, $grant);

        return response()->noContent();
    }
}

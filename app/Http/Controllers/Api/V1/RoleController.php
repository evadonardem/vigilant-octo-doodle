<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Repositories\RoleRepository;

class RoleController extends Controller
{
    public function __construct(
        protected RoleRepository $roleRepository
    ) {}

    public function index()
    {
        $roles = $this->roleRepository->getAllRoles();

        return RoleResource::collection($roles);
    }
}

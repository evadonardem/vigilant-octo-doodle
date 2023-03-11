<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserPermissionResource;
use App\Repositories\UserPermissionRepository;

class UserPermissionController extends Controller
{
    public function __construct(
        private UserPermissionRepository $userPermissionRepository
    ) {}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = request()->user();

        if (!$user) {
            return null;
        }

        $userPermissions = $this->userPermissionRepository->getUserPermissions($user->id);

        return UserPermissionResource::collection($userPermissions);
    }
}

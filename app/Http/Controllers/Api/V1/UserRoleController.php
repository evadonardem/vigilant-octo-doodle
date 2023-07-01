<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserRoleResource;
use App\Repositories\UserRoleRepository;

class UserRoleController extends Controller
{
    public function __construct(
        private UserRoleRepository $userRoleRepository
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

        $userRoles = $this->userRoleRepository->getUserRoles($user->id);

        return UserRoleResource::collection($userRoles);
    }
}

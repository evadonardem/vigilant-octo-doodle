<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Repositories\RoleRepository;
use App\ZKLib\ZKLibrary;
use App\Models\User;
use App\Models\AttendanceLog;
use Illuminate\Support\Facades\Hash;

class BiometricUsersController extends Controller
{
    private $zk = null;

    public function __construct(
        protected RoleRepository $roleRepository
    ) {}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $users = User::orderBy('name', 'asc')->get();
        $users->each(function ($user) {
            if ($user->rates->count() > 0) {
                $current_per_hour_rate = $user->rates()
                    ->whereHas('type', function ($q) {
                        $q->where('code', 'per_hour');
                    })
                    ->orderBy('rates.effectivity_date', 'desc')
                    ->first();
                if ($current_per_hour_rate) {
                    $user->current_per_hour_rate_amount = $current_per_hour_rate->amount;
                } else {
                    $user->current_per_hour_rate_amount = 'N/A';
                }
            } else {
                $user->current_per_hour_rate_amount = 'N/A';
            }

            if ($user->rates->count() > 0) {
                $current_per_delivery_rate = $user->rates()
                    ->whereHas('type', function ($q) {
                        $q->where('code', 'per_delivery');
                    })
                    ->orderBy('rates.created_at', 'desc')
                    ->first();
                if ($current_per_delivery_rate) {
                    $user->current_per_delivery_rate_amount = $current_per_delivery_rate->amount;
                } else {
                    $user->current_per_delivery_rate_amount = 'N/A';
                }
            } else {
                $user->current_per_delivery_rate_amount = 'N/A';
            }
        });

        $filters = $request->input('filters');
        if (!empty($filters)) {
            if (array_key_exists('role_id', $filters)) {
                $roleId = $filters['role_id'];
                $users = $users->filter(function ($user) use ($roleId) {
                    return $user->role == $roleId;
                });
            }
        }

        $users = array_values($users->toArray());
        return response()->json(['data' => $users]);
    }

    /**
     * Show the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->user()->hasRole('Super Admin') && $request->input('include.roles_and_permissions')) {
            $roles = $this->roleRepository->getAllRoles()->map(function ($role) use ($user) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'has_role' => $role->users->contains('id', $user->id),
                    'permissions' => $role->permissions->map(function ($permission) use ($user) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'has_permission' => $permission->users->contains('id', $user->id),
                        ];
                    }),
                ];
            });
            $request->merge(['roles' => $roles]);
        }

        return new UserResource($user);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreUserRequest $request)
    {
        $attributes = $request->only([
            'biometric_id',
            'name',
        ]);

        if (env('DEVICE_ENABLED')) {
            $this->zk = new ZKLibrary(env('DEVICE_IP'), env('DEVICE_PORT'));
            $this->zk->connect();

            $users = $this->zk->getUser();
            $newRecordId = 1;

            if (!empty($users)) {
                $recordIds = array_column($users, 'record_id');
                $newRecordId = ((int)max($recordIds)) + 1;
            }

            $this->zk->setUser(
                $newRecordId,
                $attributes['biometric_id'],
                $attributes['name'],
                '',
                0
            );

            $this->zk->disconnect();
        }

        $user = User::create([
          'biometric_id' => $attributes['biometric_id'],
          'name' => $attributes['name'],
          'password' => ''
        ]);

        return ($user)
          ? response()->noContent()
          : response()->json('Forbidden', 403);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(StoreUserRequest $request, $id)
    {
        $deviceUser = null;
        $storedUser = User::findOrFail($id);

        $attributes = $request->only([
            'name',
        ]);

        if (env('DEVICE_ENABLED')) {
            $this->zk = new ZKLibrary(env('DEVICE_IP'), env('DEVICE_PORT'));
            $this->zk->connect();

            $deviceUsers = $this->zk->getUser();
            $filteredDeviceUsers = array_filter(
                $deviceUsers,
                function ($deviceUser) use ($storedUser) {
                    return $deviceUser['biometric_id'] == $storedUser->biometric_id;
                }
            );

            $deviceUser = (count($filteredDeviceUsers) > 0)
                ? array_pop($filteredDeviceUsers)
                : null;

            if ($deviceUser) {
                $this->zk->setUser(
                    $deviceUser['record_id'],
                    $deviceUser['biometric_id'],
                    $attributes['name'],
                    $deviceUser['password'],
                    $deviceUser['role_id']
                );
            }

            $this->zk->disconnect();
        }

        $storedUser->name = $attributes['name'];
        $storedUser->save();

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $deviceUser = null;
        $storedUser = User::findOrFail($id);

        if (env('DEVICE_ENABLED')) {
            $this->zk = new ZKLibrary(env('DEVICE_IP'), env('DEVICE_PORT'));
            $this->zk->connect();

            $deviceUsers = $this->zk->getUser();

            $filteredDeviceUsers = array_filter(
                $deviceUsers,
                function ($deviceUser) use ($storedUser) {
                    return $deviceUser['biometric_id'] == $storedUser->biometric_id;
                }
            );

            $deviceUser = (count($filteredDeviceUsers) > 0)
                ? array_pop($filteredDeviceUsers)
                : null;

            if ($deviceUser) {
                $this->zk->deleteUser($deviceUser['record_id']);
                $this->zk->disconnect();
            }
        }

        $storedUser->delete();
        AttendanceLog::where(
            'biometric_id',
            '=',
            $storedUser->biometric_id
        )->delete();

        return response()->noContent();
    }

    public function defaultPassword(Request $request, User $user)
    {
        if ($request->user()->cannot('Update existing user')) {
            abort(403);
        }

        $user->password = Hash::make($request->input('default_password'));
        $user->save();

        return response()->noContent();
    }

    public function syncAdminUsers()
    {
        if (env('DEVICE_ENABLED')) {
            $this->zk = new ZKLibrary(env('DEVICE_IP'), env('DEVICE_PORT'));
            $this->zk->connect();
            $deviceUsers = $this->zk->getUser();
            $this->zk->disconnect();

            $deviceUsersAdmin = array_filter(
                $deviceUsers,
                function ($deviceUser) {
                    return $deviceUser['role_id'] == 14;
                }
            );

            $isSync = false;
            foreach ($deviceUsersAdmin as $deviceUserAdmin) {
                $user = User::where(
                    'biometric_id',
                    '=',
                    $deviceUserAdmin['biometric_id']
                )->first();
                $user->password = Hash::make($deviceUserAdmin['password']);
                $isSync = $isSync || $user->save();
            }

            if ($isSync) {
                return response()->json([
                  'message' => 'Successfully sync admin users.'
                ]);
            }

            return response()->json(
                [
                  'error' => 'No registered admin to be sync.'
                ],
                422
            );
        }

        return response()->json(
            [
              'error' => 'Biometric device is disabled.'
            ],
            422
        );
    }

    public function syncAllUsers()
    {
        if (env('DEVICE_ENABLED')) {
            $this->zk = new ZKLibrary(env('DEVICE_IP'), env('DEVICE_PORT'));
            $this->zk->connect();
            $biometricUsers = $this->zk->getUser();
            $this->zk->disconnect();

            $usersCount = User::all()->count();

            if ($usersCount == 0) {
                foreach ($biometricUsers as $user) {
                    User::create([
                        'biometric_id' => $user['biometric_id'],
                        'name' => $user['name'],
                        'password' => !empty($user['password'])
                            ? Hash::make($user['password'])
                            : ''
                    ]);
                }

                return response()->json(
                    [
                      'message' => 'Successfully sync all users.'
                    ],
                    422
                );
            }

            return response()->json(
                [
                  'error' => 'Cannot sync all users.'
                ],
                422
            );
        }

        return response()->json(
            [
              'error' => 'Biometric device is disabled.'
            ],
            422
        );
    }

    public function deviceUsers()
    {
        if (env('DEVICE_ENABLED')) {
            $this->zk = new ZKLibrary(env('DEVICE_IP'), env('DEVICE_PORT'));
            $this->zk->connect();
            $deviceUsers = $this->zk->getUser();
            $this->zk->disconnect();

            return response()->json(
                [
                  'data' => $deviceUsers
                ],
                422
            );
        }
        return response()->json(
            [
            'error' => 'Biometric device is disabled.'
          ],
            422
        );
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Roles and permissions master list
        $rolesAndPermissions = collect([
            'Super Admin' => [],
            'Manage Purchase Order' => [
                'Create purchase order',
                'Update purchase order',
                'Delete purchase order',
                'View purchase order',
            ],
            'Manage Warehouse Inventory' => [
                'Create warehouse inventory',
                'Update warehouse inventory',
                'Delete warehouse inventory',
                'View warehouse inventory',
            ],
            'Manage Users Registry' => [
                'Create or register new user',
                'Update existing user',
                'Delete or unregister user',
                'View registered user',
            ],
        ])->map(function ($permissions, $role) {
            return [
                'name' => $role,
                'permissions' => collect($permissions)->map(function ($permission) {
                    return ['name' => $permission];
                })
            ];
        });

        // Register roles and permissions
        $rolesAndPermissions->each(function ($role) {
            $permissions = $role['permissions'];
            unset($role['permissions']);

            $existRole = Role::where('name', $role)->first();
            $newRole = $existRole ?? Role::create($role);
            $permissions->each(function ($permission) use ($newRole) {
                $existPermission = Permission::where('name', $permission)->first();
                if (!$existPermission) {
                    $newPermission = Permission::create($permission);
                    $newRole->givePermissionTo($newPermission);
                } else {
                    $newRole->givePermissionTo($existPermission);
                }
            });
        });
    }
}
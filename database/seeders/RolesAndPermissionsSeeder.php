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
            'Manage Manual Biometric Logs' => [
                'Create manual biometric logs',
                'Update manual biometric logs',
                'Delete manual biometric logs',
                'View manual biometric logs',
            ],
            'Manage Delivery Logs' => [
                'Create manual delivery logs',
                'Update manual delivery logs',
                'Delete manual delivery logs',
                'View manual delivery logs',
            ],
            'Manage Pay Period' => [
                'Create pay period',
                'Update pay period',
                'Delete pay period',
                'View pay period',
            ],
            'Manage Purchase Order' => [
                'Create purchase order',
                'Update purchase order',
                'Delete purchase order',
                'View purchase order',
            ],
            'Manage Sales Invoice' => [
                'Create sales invoice',
                'Update sales invoice',
                'Delete sales invoice',
                'View sales invoice',
            ],
            'Manage Stock Card' => [
                'Create stock card',
                'Update stock card',
                'Delete stock card',
                'View stock card',
            ],
            'Manage Trend' => [
                'Generate store trend',
                'Generate item trend',
            ],
            'Manage Users Registry' => [
                'Create or register new user',
                'Update existing user',
                'Delete or unregister user',
                'View registered user',
            ],
            'Manage Stores Registry' => [
                'Create or register new store',
                'Update existing store',
                'Delete or unregister store',
                'View registered store',
            ],
            'Manage Store Promodisers Registry' => [
                'Create or register new store promodiser',
                'Update existing store promodiser',
                'Delete or unregister store promodiser',
                'View registered store promodiser',
            ],
            'Manage Store Item Pricing' => [
                'Create or update store item pricing',
                'View registered store item pricing',
            ],
            'Manage Delivery Receipt Payments' => [
                'Create or update delivery receipt payments',
                'Delete delivery receipt payments',
                'View delivery receipt payments',
            ],
            'Manage Reports' => [
                'Generate delivery sales monitoring report',
                'Generate delivery receipt monitoring report',
                'Generate sales invoice monitoring report',
                'Generate stock cards monitoring report',
                'Generate promodisers summary report',
                'Generate item sales monitoring report',
                'Generate delivery trips summary report',
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

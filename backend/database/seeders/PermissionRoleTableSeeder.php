<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionRoleTableSeeder extends Seeder
{
    public function run()
    {
        $admin_permissions = Permission::all();
        Role::findOrFail(1)->permissions()->sync($admin_permissions->pluck('id'));
        $user_permissions = $admin_permissions->filter(function ($permission) {
            $title = $permission->title;
            // Exclude management and administrative permissions
            return !str_starts_with($title, 'user_') && 
                   !str_starts_with($title, 'role_') && 
                   !str_starts_with($title, 'permission_') &&
                   !str_starts_with($title, 'audit_log_') &&
                   !str_starts_with($title, 'setting_');
        });
        Role::findOrFail(2)->permissions()->sync($user_permissions->pluck('id'));
    }
}
<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionsTableSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            [
                'id'    => 1,
                'title' => 'user_management_access',
            ],
            [
                'id'    => 2,
                'title' => 'permission_create',
            ],
            [
                'id'    => 3,
                'title' => 'permission_edit',
            ],
            [
                'id'    => 4,
                'title' => 'permission_show',
            ],
            [
                'id'    => 5,
                'title' => 'permission_delete',
            ],
            [
                'id'    => 6,
                'title' => 'permission_access',
            ],
            [
                'id'    => 7,
                'title' => 'role_create',
            ],
            [
                'id'    => 8,
                'title' => 'role_edit',
            ],
            [
                'id'    => 9,
                'title' => 'role_show',
            ],
            [
                'id'    => 10,
                'title' => 'role_delete',
            ],
            [
                'id'    => 11,
                'title' => 'role_access',
            ],
            [
                'id'    => 12,
                'title' => 'user_create',
            ],
            [
                'id'    => 13,
                'title' => 'user_edit',
            ],
            [
                'id'    => 14,
                'title' => 'user_show',
            ],
            [
                'id'    => 15,
                'title' => 'user_delete',
            ],
            [
                'id'    => 16,
                'title' => 'user_access',
            ],
            [
                'id'    => 17,
                'title' => 'client_create',
            ],
            [
                'id'    => 18,
                'title' => 'client_edit',
            ],
            [
                'id'    => 19,
                'title' => 'client_show',
            ],
            [
                'id'    => 20,
                'title' => 'client_delete',
            ],
            [
                'id'    => 21,
                'title' => 'client_access',
            ],
            [
                'id'    => 22,
                'title' => 'station_create',
            ],
            [
                'id'    => 23,
                'title' => 'station_edit',
            ],
            [
                'id'    => 24,
                'title' => 'station_show',
            ],
            [
                'id'    => 25,
                'title' => 'station_delete',
            ],
            [
                'id'    => 26,
                'title' => 'station_access',
            ],
            [
                'id'    => 27,
                'title' => 'produit_create',
            ],
            [
                'id'    => 28,
                'title' => 'produit_edit',
            ],
            [
                'id'    => 29,
                'title' => 'produit_show',
            ],
            [
                'id'    => 30,
                'title' => 'produit_delete',
            ],
            [
                'id'    => 31,
                'title' => 'produit_access',
            ],
            [
                'id'    => 32,
                'title' => 'reservation_create',
            ],
            [
                'id'    => 33,
                'title' => 'reservation_edit',
            ],
            [
                'id'    => 34,
                'title' => 'reservation_show',
            ],
            [
                'id'    => 35,
                'title' => 'reservation_delete',
            ],
            [
                'id'    => 36,
                'title' => 'reservation_access',
            ],
            [
                'id'    => 37,
                'title' => 'coli_create',
            ],
            [
                'id'    => 38,
                'title' => 'coli_edit',
            ],
            [
                'id'    => 39,
                'title' => 'coli_show',
            ],
            [
                'id'    => 40,
                'title' => 'coli_delete',
            ],
            [
                'id'    => 41,
                'title' => 'coli_access',
            ],
            [
                'id'    => 42,
                'title' => 'audit_log_show',
            ],
            [
                'id'    => 43,
                'title' => 'audit_log_access',
            ],
            [
                'id'    => 44,
                'title' => 'profile_password_edit',
            ],
            [
                'id'    => 45,
                'title' => 'dashboard_access',
            ],
            [
                'id'    => 46,
                'title' => 'pub_create',
            ],
            [
                'id'    => 47,
                'title' => 'pub_edit',
            ],
            [
                'id'    => 48,
                'title' => 'pub_show',
            ],
            [
                'id'    => 49,
                'title' => 'pub_delete',
            ],
            [
                'id'    => 50,
                'title' => 'pub_access',
            ],
            [
                'id'    => 51,
                'title' => 'setting_access',
            ],
            [
                'id'    => 52,
                'title' => 'setting_edit',
            ],
            [
                'id'    => 53,
                'title' => 'revenue_show',
            ],
            [
                'id'    => 54,
                'title' => 'export_csv',
            ],
            [
                'id'    => 55,
                'title' => 'commande_create',
            ],
            [
                'id'    => 56,
                'title' => 'commande_edit',
            ],
            [
                'id'    => 57,
                'title' => 'commande_show',
            ],
            [
                'id'    => 58,
                'title' => 'commande_delete',
            ],
            [
                'id'    => 59,
                'title' => 'commande_access',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['id' => $permission['id']], $permission);
        }
    }
}
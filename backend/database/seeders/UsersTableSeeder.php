<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'id'             => 1,
                'name'           => 'Admin',
                'email'          => 'admin@admin.com',
                'tel'            => '+2290146862536',
                'password'       => bcrypt('password'),
                'remember_token' => null,
                'phone_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrInsert(['id' => $userData['id']], $userData);
        }
    }
}
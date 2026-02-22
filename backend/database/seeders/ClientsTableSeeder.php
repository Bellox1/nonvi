<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class ClientsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer 100 utilisateurs sans rôles (qui seront considérés comme des clients)
        User::factory()->count(100)->create();
    }
}

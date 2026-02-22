<?php

namespace Database\Seeders;

use App\Models\Station;
use Illuminate\Database\Seeder;

class StationsTableSeeder extends Seeder
{
    public function run()
    {
        $stations = [
            ['nom' => 'Jonquet', 'ville' => 'Cotonou'],
            ['nom' => 'Ouando', 'ville' => 'Porto-Novo'],
            ['nom' => 'Kpota', 'ville' => 'Abomey-Calavi'],
            ['nom' => 'Albarika', 'ville' => 'Parakou'],
            ['nom' => 'Gare', 'ville' => 'Bohicon'],
        ];

        foreach ($stations as $station) {
            Station::create($station);
        }
    }
}

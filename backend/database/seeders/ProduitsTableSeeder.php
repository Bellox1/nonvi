<?php

namespace Database\Seeders;

use App\Models\Produit;
use Illuminate\Database\Seeder;

class ProduitsTableSeeder extends Seeder
{
    public function run()
    {
        $produits = [
            [
                'nom' => 'Bouteille d\'eau 1.5L',
                'prix' => 500,
                'description' => 'Eau minérale fraîche pour votre voyage.',
                'stock' => 100,
            ],
            [
                'nom' => 'Pack de Biscuits',
                'prix' => 1000,
                'description' => 'Assortiment de biscuits croustillants.',
                'stock' => 50,
            ],
            [
                'nom' => 'Chargeur Rapide USB',
                'prix' => 5000,
                'description' => 'Chargeur compatible tous smartphones.',
                'stock' => 20,
            ],
            [
                'nom' => 'Écouteurs Bluetooth',
                'prix' => 7500,
                'description' => 'Écouteurs sans fil haute qualité.',
                'stock' => 15,
            ],
        ];

        foreach ($produits as $produit) {
            Produit::create($produit);
        }
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\CommandeItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use App\Traits\ExportCsvTrait;

class AdminCommandeController extends Controller
{
    use ExportCsvTrait;

    public function export()
    {
        if (!Gate::allows('export_csv')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $commandes = Commande::with(['user', 'items.produit', 'station'])->latest()->get();

        $data = $commandes->map(function($c) {
            $produits = $c->items->map(fn($i) => $i->produit->nom . ' x' . $i->quantite)->implode(', ');
            return [
                $c->id,
                $c->user ? 'Inscrit' : 'Non inscrit',
                $c->user->name ?? ($c->guest_name ?? 'Inconnu'),
                $c->user->tel ?? ($c->guest_phone ?? 'N/A'),
                $produits,
                $c->prix_total,
                $c->payment_method ?? 'N/A',
                $c->statut,
                $c->station->nom ?? 'N/A',
                $c->ville_livraison ?? 'N/A',
                $c->created_at->format('d/m/Y H:i'),
            ];
        });

        return $this->downloadCsv($data, 'commandes-' . date('Y-m-d'), [
            'ID', 'Type', 'Client', 'Téléphone', 'Produits', 'Total', 'Paiement', 'Statut', 'Station', 'Ville', 'Date'
        ]);
    }
    public function index(Request $request)
    {
        if (!Gate::allows('commande_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $query = Commande::with(['user', 'items.produit', 'produit', 'station'])->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($qu) use ($search) {
                    $qu->where('name', 'like', "%{$search}%")
                       ->orWhere('tel', 'like', "%{$search}%")
                       ->orWhere('unique_id', 'like', "%{$search}%");
                })
                ->orWhereHas('station', function($qs) use ($search) {
                    $qs->where('nom', 'like', "%{$search}%");
                })
                ->orWhere('guest_name', 'like', "%{$search}%")
                ->orWhere('guest_phone', 'like', "%{$search}%")
                ->orWhere('id', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        if (!Gate::allows('commande_create')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'guest_name' => 'required_without:user_id|nullable|string',
            'guest_phone' => 'required_without:user_id|nullable|string',
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'required|exists:produits,id',
            'items.*.quantite' => 'required|integer|min:1',
            'ville_livraison' => 'required|string',
            'station_id' => 'required|exists:stations,id',
            'moyen_paiement' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            $prix_total = 0;
            $items_data = [];

            foreach ($request->items as $item) {
                $produit = Produit::findOrFail($item['produit_id']);
                
                if ($produit->stock < $item['quantite']) {
                    throw new \Exception("Stock insuffisant pour le produit: {$produit->nom}");
                }

                $prix_unitaire = $produit->prix;
                $prix_total += $prix_unitaire * $item['quantite'];
                
                $items_data[] = [
                    'produit' => $produit,
                    'quantite' => $item['quantite'],
                    'prix_unitaire' => $prix_unitaire,
                ];
            }

            $commande = Commande::create([
                'user_id' => $request->user_id,
                'guest_name' => $request->guest_name,
                'guest_phone' => $request->guest_phone,
                'prix_total' => $prix_total,
                'statut' => 'livre',
                'type_retrait' => 'sur_place',
                'payment_status' => 'paid',
                'payment_method' => $request->moyen_paiement,
                'ville_livraison' => $request->ville_livraison,
                'station_id' => $request->station_id,
            ]);

            foreach ($items_data as $data) {
                CommandeItem::create([
                    'commande_id' => $commande->id,
                    'produit_id' => $data['produit']->id,
                    'quantite' => $data['quantite'],
                    'prix_unitaire' => $data['prix_unitaire'],
                ]);

                // Reduction du stock
                $data['produit']->decrement('stock', $data['quantite']);
            }

            return response()->json([
                'message' => 'Commande enregistrée avec succès',
                'commande' => $commande->load(['user', 'items.produit'])
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        if (!Gate::allows('commande_edit')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'statut' => 'nullable|string|in:en_attente,confirme,livre,annule',
            'ville_livraison' => 'nullable|string',
            'station_id' => 'nullable|exists:stations,id',
            'guest_name' => 'nullable|string',
            'guest_phone' => 'nullable|string',
            'items' => 'nullable|array|min:1',
            'items.*.produit_id' => 'required_with:items|exists:produits,id',
            'items.*.quantite' => 'required_with:items|integer|min:1',
        ]);

        $commande = Commande::findOrFail($id);

        return DB::transaction(function () use ($request, $commande) {
            // Update basic info
            $commande->update($request->only([
                'statut', 'ville_livraison', 'station_id', 'guest_name', 'guest_phone'
            ]));

            // Update Items if provided
            if ($request->has('items')) {
                // 1. Restore stock for previous items
                foreach ($commande->items as $oldItem) {
                    $oldItem->produit->increment('stock', $oldItem->quantite);
                }
                
                // 2. Clear old items
                $commande->items()->delete();

                // 3. Process new items
                $prix_total = 0;
                foreach ($request->items as $itemData) {
                    $produit = Produit::findOrFail($itemData['produit_id']);
                    
                    if ($produit->stock < $itemData['quantite']) {
                        throw new \Exception("Stock insuffisant pour le produit: {$produit->nom}");
                    }

                    $commande->items()->create([
                        'produit_id' => $produit->id,
                        'quantite' => $itemData['quantite'],
                        'prix_unitaire' => $produit->prix,
                    ]);

                    $prix_total += $produit->prix * $itemData['quantite'];
                    $produit->decrement('stock', $itemData['quantite']);
                }

                // Update total price
                $commande->update(['prix_total' => $prix_total]);
            }

            return response()->json([
                'message' => 'Commande mise à jour avec succès',
                'commande' => $commande->refresh()->load(['user', 'items.produit', 'station'])
            ]);
        });
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('commande_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $commande = Commande::with('items.produit')->findOrFail($id);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($commande) {
            // Restore stock
            foreach ($commande->items as $item) {
                if ($item->produit) {
                    $item->produit->increment('stock', $item->quantite);
                }
            }

            $commande->items()->delete();
            $commande->delete();

            return response()->json(['message' => 'Commande supprimée avec succès']);
        });
    }
}

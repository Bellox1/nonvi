<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Produit;
use Illuminate\Http\Request;
use FedaPay\FedaPay;
use FedaPay\Transaction;

class CommandeController extends Controller
{
    public function __construct()
    {
        FedaPay::setApiKey(env('FEDAPAY_SECRET_KEY'));
        $isSandbox = filter_var(env('FEDAPAY_SANDBOX', true), FILTER_VALIDATE_BOOLEAN);
        FedaPay::setEnvironment($isSandbox ? 'sandbox' : 'live');
    }

    public function index(Request $request)
    {
        return response()->json(
            Commande::with(['items.produit', 'produit'])
                ->where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'required|exists:produits,id',
            'items.*.quantite' => 'required|integer|min:1',
            'type_retrait' => 'required|string|in:sur_place,livraison',
            'ville_livraison' => 'required_if:type_retrait,livraison|nullable|string',
        ]);

        $prix_total_produits = 0;
        $items_data = [];

        foreach ($request->items as $item) {
            $produit = Produit::findOrFail($item['produit_id']);
            $prix_unitaire = $produit->prix;
            $prix_total_produits += $prix_unitaire * $item['quantite'];
            
            $items_data[] = [
                'produit_id' => $item['produit_id'],
                'quantite' => $item['quantite'],
                'prix_unitaire' => $prix_unitaire,
            ];
        }
        
        $prix_livraison = ($request->type_retrait === 'livraison') ? 1000 : 0;
        $prix_total = $prix_total_produits + $prix_livraison;

        try {
            $transaction = Transaction::create([
                "description" => "Paiement Commande Boutique",
                "amount" => (int) $prix_total,
                "currency" => ["iso" => "XOF"],
                "callback_url" => route('api.payment.callback', ['type' => 'commande', 'id' => 0]),
                "customer" => [
                    "firstname" => auth()->user()->name,
                    "email" => auth()->user()->email,
                ]
            ]);

            $token = $transaction->generateToken();

            \App\Models\PendingPayment::create([
                'payment_id' => $transaction->id,
                'type' => 'commande',
                'user_id' => auth()->id(),
                'data' => [
                    'items' => $items_data,
                    'type_retrait' => $request->type_retrait,
                    'ville_livraison' => $request->ville_livraison,
                    'prix_total' => $prix_total
                ]
            ]);

            return response()->json([
                'message' => 'Paiement initié',
                'checkout_url' => $token->url,
                'transaction_id' => $transaction->id
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur FedaPay: ' . $e->getMessage()], 500);
        }
    }
}

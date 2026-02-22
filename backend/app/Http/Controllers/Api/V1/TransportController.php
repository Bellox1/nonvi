<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Station;
use App\Models\Ticket;
use Illuminate\Http\Request;
use FedaPay\FedaPay;
use FedaPay\Transaction;

class TransportController extends Controller
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
            $request->user()->reservations()
                ->with(['station_depart', 'station_arrivee', 'tickets'])
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'station_depart_id' => 'required|exists:stations,id',
            'station_arrivee_id' => 'required|exists:stations,id',
            'date_depart' => 'required|date',
            'heure_depart' => 'required',
            'nombre_tickets' => 'required|integer|min:1',
            'moyen_paiement' => 'required',
        ]);

        $prixSetting = \App\Models\Setting::where('key', 'prix_ticket')->first();
        $prixUnit = $prixSetting ? (float)$prixSetting->value : 0;
        $prixTotal = $prixUnit * $request->nombre_tickets;

        try {
            $transaction = Transaction::create([
                "description" => "Paiement Réservation Voyage",
                "amount" => (int) $prixTotal,
                "currency" => ["iso" => "XOF"],
                "callback_url" => route('api.payment.callback', ['type' => 'reservation', 'id' => 0]), // ID 0 because not created yet
                "customer" => [
                    "firstname" => auth()->user()->name,
                    "email" => auth()->user()->email,
                ]
            ]);

            $token = $transaction->generateToken();

            // Store pending data instead of creating reservation
            \App\Models\PendingPayment::create([
                'payment_id' => $transaction->id,
                'type' => 'reservation',
                'user_id' => auth()->id(),
                'data' => array_merge($request->all(), ['prix' => $prixTotal])
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

    public function stations()
    {
        return response()->json(Station::all());
    }
}

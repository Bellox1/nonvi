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
            'date_depart' => 'required|date|after_or_equal:today',
            'heure_depart' => ['required', 'regex:/^(0[6-9]|1[0-9]|20):[0-5][0-9]|21:(0[0-9]|1[0-9]|2[0-9]|30)$/'],
            'nombre_tickets' => 'required|integer|min:1',
            'moyen_paiement' => 'required',
        ]);

        // Check if today and time is already passed
        if ($request->date_depart === date('Y-m-d')) {
            $currentTime = date('H:i');
            if ($request->heure_depart < $currentTime) {
                return response()->json(['message' => 'L\'heure de départ choisie est déjà passée.'], 422);
            }
        }

        // Check seats availability
        $capacitySetting = \App\Models\Setting::where('key', 'nb_bus_places')->first();
        $capacity = $capacitySetting ? (int)$capacitySetting->value : 50;

        $bookedSeats = Reservation::where('date_depart', $request->date_depart)
            ->where('heure_depart', $request->heure_depart)
            ->where('station_depart_id', $request->station_depart_id)
            ->whereIn('statut', ['confirme', 'en_trajet', 'termine'])
            ->sum('nombre_tickets');
        
        // Also check pending payments to avoid overbooking
        $pendingSeats = \App\Models\PendingPayment::where('type', 'reservation')
            ->where('created_at', '>=', now()->subMinutes(15)) // Only check recent pending
            ->get()
            ->filter(function($p) use ($request) {
                return $p->data['date_depart'] === $request->date_depart && 
                       $p->data['heure_depart'] === $request->heure_depart &&
                       $p->data['station_depart_id'] == $request->station_depart_id;
            })
            ->sum(function($p) {
                return $p->data['nombre_tickets'];
            });

        if (($bookedSeats + $pendingSeats + $request->nombre_tickets) > $capacity) {
            $remaining = $capacity - ($bookedSeats + $pendingSeats);
            $message = $remaining > 0 
                ? "Désolé, il ne reste que {$remaining} places disponibles pour ce trajet."
                : "Désolé, ce bus est déjà complet pour l'heure choisie.";
            return response()->json(['message' => $message], 422);
        }

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
                    "email" => auth()->user()->email ?? 'customer@nonviplus.com',
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
            \Log::error('FedaPay Transport Error: ' . $e->getMessage(), [
                'user' => auth()->user(),
                'exception' => $e
            ]);
            return response()->json(['message' => 'Erreur FedaPay: ' . $e->getMessage()], 500);
        }
    }

    public function stations()
    {
        return response()->json(Station::all());
    }

    public function getAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'station_id' => 'required|exists:stations,id'
        ]);

        $capacitySetting = \App\Models\Setting::where('key', 'nb_bus_places')->first();
        $capacity = $capacitySetting ? (int)$capacitySetting->value : 50;

        $booked = Reservation::where('date_depart', $request->date)
            ->where('station_depart_id', $request->station_id)
            ->whereIn('statut', ['confirme', 'en_trajet', 'termine'])
            ->groupBy('heure_depart')
            ->select('heure_depart', \DB::raw('SUM(nombre_tickets) as total'))
            ->get()
            ->pluck('total', 'heure_depart');

        $pending = \App\Models\PendingPayment::where('type', 'reservation')
            ->where('created_at', '>=', now()->subMinutes(15))
            ->get()
            ->filter(function($p) use ($request) {
                return $p->data['date_depart'] === $request->date && 
                       $p->data['station_depart_id'] == $request->station_id;
            })
            ->groupBy(function($p) {
                return $p->data['heure_depart'];
            })
            ->map(function($group) {
                return $group->sum(function($p) {
                    return $p->data['nombre_tickets'];
                });
            });

        $results = [];
        // Create a unique list of times from both sources
        $times = $booked->keys()->concat($pending->keys())->unique();

        foreach ($times as $time) {
            $totalBooked = ($booked[$time] ?? 0) + ($pending[$time] ?? 0);
            
            // Normalize time key to HH:mm (remove seconds if present)
            $normalizedTime = substr($time, 0, 5);
            
            // If we have multiple entries for same HM (unlikely but safe), we sum them or just overwrite
            $results[$normalizedTime] = max(0, $capacity - $totalBooked);
        }

        return response()->json([
            'capacity' => $capacity,
            'availability' => $results
        ]);
    }
}

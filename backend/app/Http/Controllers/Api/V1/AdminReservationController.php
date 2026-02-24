<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

use App\Traits\ExportCsvTrait;

class AdminReservationController extends Controller
{
    use ExportCsvTrait;

    public function export()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('export_csv')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $reservations = \App\Models\Reservation::with(['user', 'station_depart', 'station_arrivee'])->latest()->get();
        
        $data = $reservations->map(function($res) {
            return [
                $res->id,
                $res->user->name ?? 'N/A',
                $res->station_depart->nom ?? 'N/A',
                $res->station_arrivee->nom ?? 'N/A',
                $res->nombre_tickets,
                $res->prix,
                $res->statut,
                $res->created_at->format('d/m/Y H:i')
            ];
        });

        return $this->downloadCsv($data, 'reservations-' . date('Y-m-d'), [
            'ID', 'Client', 'Départ', 'Arrivée', 'Tickets', 'Prix', 'Statut', 'Date'
        ]);
    }
    public function index(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('reservation_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $query = Reservation::with(['user', 'station_depart', 'station_arrivee', 'tickets'])->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($qu) use ($search) {
                    $qu->where('name', 'like', "%{$search}%")
                       ->orWhere('tel', 'like', "%{$search}%")
                       ->orWhere('unique_id', 'like', "%{$search}%");
                })
                ->orWhereHas('tickets', function($qt) use ($search) {
                    $qt->where('code', 'like', "%{$search}%");
                })
                ->orWhere('guest_name', 'like', "%{$search}%")
                ->orWhere('guest_phone', 'like', "%{$search}%")
                ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $reservations = $query->paginate(20);

        return response()->json($reservations);
    }

    public function searchUsers(Request $request)
    {
        $search = $request->get('q');
        $users = \App\Models\User::where('name', 'like', "%{$search}%")
            ->orWhere('tel', 'like', "%{$search}%")
            ->orWhere('unique_id', 'like', "%{$search}%")
            ->limit(10)
            ->get(['id', 'name', 'tel', 'unique_id']);
        
        return response()->json($users);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('reservation_edit')) {
            return response()->json(['message' => 'Action refusée.'], 403);
        }

        $request->validate([
            'station_depart_id' => 'required|exists:stations,id',
            'station_arrivee_id' => 'required|exists:stations,id',
            'date_depart' => 'required|date',
            'heure_depart' => 'required|string',
            'nombre_tickets' => 'required|integer|min:1',
            'user_id' => 'nullable|exists:users,id',
            'guest_name' => 'nullable|string|required_without:user_id',
            'guest_phone' => 'nullable|string',
            'prix' => 'required|numeric'
        ]);

        $reservation = Reservation::create([
            'user_id' => $request->user_id,
            'guest_name' => $request->guest_name,
            'guest_phone' => $request->guest_phone,
            'station_depart_id' => $request->station_depart_id,
            'station_arrivee_id' => $request->station_arrivee_id,
            'nombre_tickets' => $request->nombre_tickets,
            'date_depart' => $request->date_depart,
            'heure_depart' => $request->heure_depart,
            'moyen_paiement' => 'Espèces (Admin)',
            'statut' => 'confirme',
            'prix' => $request->prix,
            'payment_status' => 'paid'
        ]);

        // Generate tickets
        for ($i = 0; $i < $request->nombre_tickets; $i++) {
            $code = strtoupper(\Illuminate\Support\Str::random(8));
            while (\App\Models\Ticket::where('code', $code)->exists()) {
                $code = strtoupper(\Illuminate\Support\Str::random(8));
            }
            $reservation->tickets()->create([
                'code' => $code,
                'is_scanned' => false,
            ]);
        }

        return response()->json([
            'message' => 'Réservation créée avec succès',
            'reservation' => $reservation->load(['user', 'tickets'])
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('reservation_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $request->validate([
            'statut' => 'required|string|in:en_attente,confirme,annule,termine,en_trajet'
        ]);

        $reservation = Reservation::findOrFail($id);
        $reservation->update(['statut' => $request->statut]);

        return response()->json([
            'message' => 'Statut mis à jour avec succès',
            'reservation' => $reservation
        ]);
    }

    public function bulkUpdateStatus(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('reservation_edit')) {
            return response()->json(['message' => 'Action refusée.'], 403);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:reservations,id',
            'statut' => 'required|string|in:en_attente,confirme,annule,termine,en_trajet'
        ]);

        Reservation::whereIn('id', $request->ids)->update(['statut' => $request->statut]);

        return response()->json([
            'message' => count($request->ids) . ' réservations mises à jour.'
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('reservation_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $reservation = Reservation::findOrFail($id);
        $reservation->delete();

        return response()->json(['message' => 'Réservation supprimée']);
    }

    public function scan(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('reservation_access')) {
            return response()->json(['message' => 'Accès refusé. Vous n\'avez pas les permissions pour effectuer cette action.'], 403);
        }

        $request->validate([
            'qr_code' => 'required|string' // on garde le nom du champ pour la simplicité du frontend
        ]);

        // On cherche d'abord dans la table tickets
        $ticket = \App\Models\Ticket::with(['reservation.user', 'reservation.station_depart', 'reservation.station_arrivee'])
            ->where('code', $request->qr_code)
            ->first();

        if ($ticket) {
            if ($ticket->is_scanned) {
                return response()->json([
                    'message' => 'Ce ticket (individuel) a déjà été utilisé !',
                    'reservation' => $ticket->reservation
                ], 422);
            }

            $ticket->update(['is_scanned' => true]);
            
            // Si tous les tickets de la réservation sont scannés, on met la réservation à 'termine'
            $reservation = $ticket->reservation;
            $allScanned = !$reservation->tickets()->where('is_scanned', false)->exists();
            if ($allScanned) {
                $reservation->update(['statut' => 'termine', 'is_scanned' => true]);
            }

            return response()->json([
                'message' => 'Ticket validé avec succès !',
                'reservation' => $reservation
            ]);
        }

        // Fallback pour les anciennes réservations (sans table tickets)
        $reservation = Reservation::with(['user', 'station_depart', 'station_arrivee'])
            ->where('qr_code', $request->qr_code)
            ->first();

        if (!$reservation) {
            return response()->json(['message' => 'Ticket invalide ou introuvable'], 404);
        }

        if ($reservation->is_scanned) {
            return response()->json([
                'message' => 'Ticket déjà utilisé ! Ce ticket ne peut être scanné qu\'une seule fois.',
                'reservation' => $reservation
            ], 422);
        }

        $reservation->update(['is_scanned' => true, 'statut' => 'termine']);

        return response()->json([
            'message' => 'Ticket validé avec succès ! Voyage commencé.',
            'reservation' => $reservation
        ]);
    }
}
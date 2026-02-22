<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class AdminReservationController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('reservation_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $reservations = Reservation::with(['user', 'station_depart', 'station_arrivee', 'tickets'])
            ->latest()
            ->paginate(20);

        return response()->json($reservations);
    }

    public function updateStatus(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('reservation_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $request->validate([
            'statut' => 'required|string|in:en_attente,confirme,annule,termine'
        ]);

        $reservation = Reservation::findOrFail($id);
        $reservation->update(['statut' => $request->statut]);

        return response()->json([
            'message' => 'Statut mis à jour avec succès',
            'reservation' => $reservation
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

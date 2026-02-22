<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Produit;
use App\Models\Commande;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('dashboard_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        // Auto-update status for overdue reservations
        $now = now();
        Reservation::where('statut', 'en_attente')
            ->whereNotNull('date_depart')
            ->where(function ($query) use ($now) {
                $query->where('date_depart', '<', $now->format('Y-m-d'))
                    ->orWhere(function ($q) use ($now) {
                        $q->where('date_depart', '=', $now->format('Y-m-d'))
                          ->where('heure_depart', '<=', $now->format('H:i:s'));
                    });
            })
            ->update(['statut' => 'en_trajet']);

        $stats = [
            'total_reservations' => Reservation::count(),
            'total_users' => User::count(),
            'total_products' => Produit::count(),
            'total_clients' => User::doesntHave('roles')->count(),
            'pending_reservations' => Reservation::where('statut', 'en_attente')->count(),
        ];

        if (\Illuminate\Support\Facades\Gate::allows('revenue_show')) {
            $stats['revenue'] = Reservation::where('statut', 'termine')->sum('prix');
        }

        $recent_reservations = Reservation::with(['user', 'station_depart', 'station_arrivee'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_reservations' => $recent_reservations
        ]);
    }
}

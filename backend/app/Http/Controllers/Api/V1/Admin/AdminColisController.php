<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coli;
use Illuminate\Http\Request;

use App\Traits\ExportCsvTrait;

class AdminColisController extends Controller
{
    use ExportCsvTrait;

    public function export()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('export_csv')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $colis = Coli::with(['expediteur', 'station_depart', 'station_arrivee'])->latest()->get();
        
        $data = $colis->map(function($c) {
            return [
                $c->id,
                $c->expediteur->nom ?? $c->expediteur_nom ?? 'Inconnu',
                $c->destinataire_nom,
                $c->station_depart->nom ?? 'N/A',
                $c->station_arrivee->nom ?? 'N/A',
                $c->prix,
                $c->statut,
                $c->created_at->format('d/m/Y H:i')
            ];
        });

        return $this->downloadCsv($data, 'colis-' . date('Y-m-d'), [
            'ID', 'Expéditeur', 'Destinataire', 'Départ', 'Arrivée', 'Prix', 'Statut', 'Date'
        ]);
    }
    private $statusWeights = [
        'en_attente' => 0,
        'en_cours'   => 1,
        'arrive'     => 2,
        'livre'      => 3,
        'annule'     => 99, // Terminal
    ];

    private function validateStatusTransition($currentStatus, $newStatus)
    {
        if ($currentStatus === $newStatus) return true;
        
        // Cannot leave terminal statuses
        if ($currentStatus === 'livre' || $currentStatus === 'annule') {
            return false;
        }

        $currentWeight = $this->statusWeights[$currentStatus] ?? 0;
        $newWeight = $this->statusWeights[$newStatus] ?? 0;

        // Allow 'annule' ONLY from 'en_attente'
        if ($newStatus === 'annule') {
            return $currentStatus === 'en_attente';
        }

        // Cannot go backwards
        return $newWeight > $currentWeight;
    }

    private function getUpdatedTimestamps($newStatus, $currentColis = null)
    {
        $now = now()->format('H:i:s');
        $updates = [];
        $weight = $this->statusWeights[$newStatus] ?? 0;

        // Weight 1: en_cours (envoi)
        if ($weight >= 1 && (!$currentColis || !$currentColis->heure_envoi)) {
            $updates['heure_envoi'] = $now;
        }
        // Weight 2: arrive
        if ($weight >= 2 && (!$currentColis || !$currentColis->heure_arrive)) {
            $updates['heure_arrive'] = $now;
        }
        // Weight 3: livre (retrait)
        if ($weight >= 3 && (!$currentColis || !$currentColis->heure_retrait)) {
            $updates['heure_retrait'] = $now;
        }
        // Special: annule
        if ($newStatus === 'annule' && (!$currentColis || !$currentColis->heure_annule)) {
            $updates['heure_annule'] = $now;
        }

        return $updates;
    }

    public function index(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('coli_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $query = Coli::with(['station_depart', 'station_arrivee', 'user', 'expediteur'])->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('destinataire_nom', 'like', "%{$search}%")
                  ->orWhere('destinataire_tel', 'like', "%{$search}%")
                  ->orWhereHas('expediteur', function($qe) use ($search) {
                      $qe->where('name', 'like', "%{$search}%")
                         ->orWhere('tel', 'like', "%{$search}%");
                  });
            });
        }

        $colis = $query->paginate(20);
            
        return response()->json($colis);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('coli_create')) {
            return response()->json(['message' => 'Action refusée. Permission de création manquante.'], 403);
        }

        $request->validate([
            'destinataire_nom' => 'required|string|max:255',
            'destinataire_tel' => 'required|string|max:20',
            'prix' => 'required|numeric|min:0',
            'station_depart_id' => 'required|exists:stations,id',
            'station_arrivee_id' => 'required|exists:stations,id|different:station_depart_id',
            'expediteur_id' => 'required_without:expediteur_nom|nullable|exists:users,id',
            'expediteur_nom' => 'required_without:expediteur_id|nullable|string|max:255',
            'expediteur_tel' => 'required_without:expediteur_id|nullable|string|max:20',
            'statut' => 'required|string',
        ]);

        $data = $request->all();
        $data['user_id'] = auth()->id();
        
        // Cascading timestamps
        $statusUpdates = $this->getUpdatedTimestamps($request->statut);
        $data = array_merge($data, $statusUpdates);
        
        // Ensure heure_envoi is set for en_attente creation as default fallback if not already handled
        $data['heure_envoi'] = $data['heure_envoi'] ?? now()->format('H:i:s');

        $colis = Coli::create($data);

        return response()->json([
            'message' => 'Colis créé avec succès',
            'colis' => $colis->load(['station_depart', 'station_arrivee', 'user', 'expediteur'])
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('coli_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $colis = Coli::findOrFail($id);

        $request->validate([
            'destinataire_nom' => 'required|string|max:255',
            'destinataire_tel' => 'required|string|max:20',
            'prix' => 'required|numeric|min:0',
            'station_depart_id' => 'required|exists:stations,id',
            'station_arrivee_id' => 'required|exists:stations,id|different:station_depart_id',
            'expediteur_id' => 'required_without:expediteur_nom|nullable|exists:users,id',
            'expediteur_nom' => 'required_without:expediteur_id|nullable|string|max:255',
            'expediteur_tel' => 'required_without:expediteur_id|nullable|string|max:20',
            'statut' => 'required|string',
        ]);

        if (!$this->validateStatusTransition($colis->statut, $request->statut)) {
            return response()->json(['message' => 'Transition de statut invalide (impossible de revenir en arrière)'], 422);
        }

        $data = $request->all();
        $statusUpdates = $this->getUpdatedTimestamps($request->statut, $colis);
        $data = array_merge($data, $statusUpdates);

        $colis->update($data);

        return response()->json([
            'message' => 'Colis mis à jour',
            'colis' => $colis->refresh()->load(['station_depart', 'station_arrivee', 'user', 'expediteur'])
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('coli_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $colis = Coli::findOrFail($id);
        $colis->delete();

        return response()->json(['message' => 'Colis supprimé']);
    }

    public function updateStatus(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('coli_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $request->validate([
            'statut' => 'required|string'
        ]);

        $colis = Coli::findOrFail($id);
        $statut = $request->statut;
        
        if (!$this->validateStatusTransition($colis->statut, $statut)) {
            return response()->json(['message' => 'Impossible de repasser à un statut précédent'], 422);
        }

        $updateData = array_merge(['statut' => $statut], $this->getUpdatedTimestamps($statut, $colis));

        $colis->update($updateData);

        return response()->json([
            'message' => 'Statut mis à jour',
            'colis' => $colis
        ]);
    }
}

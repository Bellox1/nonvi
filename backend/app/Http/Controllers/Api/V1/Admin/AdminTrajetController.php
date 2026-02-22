<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trajet;
use Illuminate\Http\Request;

class AdminTrajetController extends Controller
{
    private function checkAdmin()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('station_access')) {
            abort(403, 'Accès refusé');
        }
    }

    public function index()
    {
        $this->checkAdmin();
        return response()->json(Trajet::with(['station_depart', 'station_arrivee'])->get());
    }

    public function store(Request $request)
    {
        $this->checkAdmin();
        $request->validate([
            'station_depart_id' => 'required|exists:stations,id',
            'station_arrivee_id' => 'required|exists:stations,id|different:station_depart_id',
            'prix' => 'required|numeric|min:0',
        ], [
            'station_depart_id.required' => 'La station de départ est obligatoire.',
            'station_arrivee_id.required' => 'La station d\'arrivée est obligatoire.',
            'station_arrivee_id.different' => 'La station d\'arrivée doit être différente de la station de départ.',
            'prix.required' => 'Le prix est obligatoire.',
            'prix.min' => 'Le prix ne peut pas être négatif.',
        ]);

        $trajet = Trajet::updateOrCreate(
            [
                'station_depart_id' => $request->station_depart_id,
                'station_arrivee_id' => $request->station_arrivee_id,
            ],
            ['prix' => $request->prix]
        );

        return response()->json([
            'message' => 'Prix du trajet enregistré avec succès',
            'trajet' => $trajet->load(['station_depart', 'station_arrivee'])
        ]);
    }

    public function destroy($id)
    {
        $this->checkAdmin();
        $trajet = Trajet::findOrFail($id);
        $trajet->delete();
        return response()->json(['message' => 'Trajet supprimé']);
    }
}

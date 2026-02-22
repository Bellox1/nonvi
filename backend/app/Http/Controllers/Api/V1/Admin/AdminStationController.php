<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Station;
use Illuminate\Http\Request;

class AdminStationController extends Controller
{
    private function checkAdmin()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('station_access')) {
            abort(403, 'Accès refusé');
        }
    }

    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('station_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        $stations = Station::latest()->paginate(20);
        return response()->json($stations);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('station_create')) {
            return response()->json(['message' => 'Action refusée. Permission de création manquante.'], 403);
        }

        $request->validate([
            'nom' => 'required|string|max:255|unique:stations,nom',
            'ville' => 'nullable|string|max:500',
        ]);

        $station = Station::create([
            'nom' => $request->nom,
            'ville' => $request->ville,
        ]);

        return response()->json([
            'message' => 'Station créée avec succès',
            'station' => $station
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('station_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $station = Station::findOrFail($id);

        $request->validate([
            'nom' => 'required|string|max:255|unique:stations,nom,' . $id,
            'ville' => 'nullable|string|max:500',
        ]);

        $station->update([
            'nom' => $request->nom,
            'ville' => $request->ville,
        ]);

        return response()->json([
            'message' => 'Station mise à jour',
            'station' => $station
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('station_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $station = Station::findOrFail($id);
        $station->delete();

        return response()->json(['message' => 'Station supprimée']);
    }
}

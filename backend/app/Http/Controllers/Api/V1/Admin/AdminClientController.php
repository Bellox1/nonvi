<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use App\Traits\ExportCsvTrait;

class AdminClientController extends Controller
{
    use ExportCsvTrait;

    public function export()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('export_csv')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $clients = User::doesntHave('roles')->latest()->get();
        
        $data = $clients->map(function($c) {
            return [
                $c->id,
                $c->unique_id,
                $c->name,
                $c->tel,
                $c->email,
                $c->points,
                $c->created_at->format('d/m/Y H:i')
            ];
        });

        return $this->downloadCsv($data, 'clients-' . date('Y-m-d'), [
            'ID', 'ID Unique', 'Nom', 'Téléphone', 'Email', 'Points', 'Date Inscription'
        ]);
    }
    private function checkAdmin()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('client_access')) {
            abort(403, 'Accès refusé');
        }
    }

    public function index(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('client_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        
        $query = User::doesntHave('roles')->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('tel', 'like', "%{$search}%")
                  ->orWhere('unique_id', 'like', "%{$search}%");
            });
        }

        $clients = $query->paginate(20);
        
        return response()->json($clients);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('client_create')) {
            return response()->json(['message' => 'Action refusée. Permission de création manquante.'], 403);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'telephone' => 'required|string|unique:users,tel',
            'email' => 'nullable|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->nom,
            'tel' => $request->telephone,
            'email' => $request->email,
            'password' => Hash::make($request->password ?? 'PlusVoyageNonvi1202@'),
        ]);

        $user->roles()->sync([]); // No role for clients created by admin

        return response()->json([
            'message' => 'Client créé avec succès',
            'client' => $user
        ], 201);
    }

    public function show($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('client_show')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('client_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'nom' => 'required|string|max:255',
            'telephone' => 'required|string|unique:users,tel,' . $id,
            'email' => 'nullable|email|max:255|unique:users,email,' . $id,
        ]);

        $user->update([
            'name' => $request->nom,
            'tel' => $request->telephone,
            'email' => $request->email,
        ]);

        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        return response()->json([
            'message' => 'Client mis à jour',
            'client' => $user
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('client_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Client supprimé']);
    }
}

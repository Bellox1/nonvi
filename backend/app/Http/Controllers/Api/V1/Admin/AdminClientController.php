<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminClientController extends Controller
{
    private function checkAdmin()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('client_access')) {
            abort(403, 'Accès refusé');
        }
    }

    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('client_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        // Return users who have NO roles (these are the mobile clients)
        $clients = User::doesntHave('roles')->latest()->paginate(20);
        
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
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->nom,
            'tel' => $request->telephone,
            'email' => $request->email,
            'password' => Hash::make($request->password ?? 'nonvi2024'),
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
            'email' => 'required|email|max:255|unique:users,email,' . $id,
        ]);

        $user->update([
            'name' => $request->nom,
            'tel' => $request->telephone,
            'email' => $request->email,
        ]);

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

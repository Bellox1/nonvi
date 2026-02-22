<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('user_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $users = User::with(['roles', 'station'])
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('user_create')) {
            return response()->json(['message' => 'Action refusée. Permission de création manquante.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->roles()->sync($request->role_id);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user->load('roles')
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('user_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role_id' => 'nullable|exists:roles,id'
        ]);

        $user->update($request->only(['name', 'email']));

        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        if ($request->role_id) {
            $user->roles()->sync($request->role_id);
        }

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user' => $user->load('roles')
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('user_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $user = User::findOrFail($id);
        if ($user->id === 1) {
            return response()->json(['message' => 'Impossible de supprimer l\'admin principal'], 403);
        }
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}

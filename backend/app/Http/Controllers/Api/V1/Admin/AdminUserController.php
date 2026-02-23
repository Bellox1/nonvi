<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use App\Traits\ExportCsvTrait;

class AdminUserController extends Controller
{
    use ExportCsvTrait;

    public function export()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('export_csv')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $users = User::with('roles')->latest()->get();
        
        $data = $users->map(function($u) {
            $roles = $u->roles->pluck('title')->implode(', ');
            return [
                $u->id,
                $u->name,
                $u->tel ?? 'N/A',
                $u->email,
                $roles ?: 'Client',
                $u->points ?? 0,
                $u->created_at ? $u->created_at->format('d/m/Y H:i') : 'N/A'
            ];
        });

        return $this->downloadCsv($data, 'comptes-' . date('Y-m-d'), [
            'ID', 'Nom', 'Téléphone', 'Email', 'Rôles/Type', 'Points', 'Date Création'
        ]);
    }
    public function index(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('user_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $query = User::with(['roles', 'station'])->latest();

        if ($request->has('type')) {
            if ($request->type === 'membre') {
                $query->has('roles');
            } elseif ($request->type === 'client') {
                $query->doesntHave('roles');
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('tel', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate(20);

        return response()->json($users);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('user_create')) {
            return response()->json(['message' => 'Action refusée. Permission de création manquante.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'tel' => 'required|string|unique:users,tel',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'tel' => $request->tel,
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
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'tel' => 'nullable|string|unique:users,tel,' . $user->id,
            'role_id' => 'nullable|exists:roles,id'
        ]);

        $user->update($request->only(['name', 'email', 'tel']));

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

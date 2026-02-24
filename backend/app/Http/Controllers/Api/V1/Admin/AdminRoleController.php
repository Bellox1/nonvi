<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AdminRoleController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('role_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $roles = Role::with(['permissions'])->latest()->get();
        return response()->json($roles);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('role_create')) {
            return response()->json(['message' => 'Action refusée. Permission de création manquante.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create($request->all());
        $role->permissions()->sync($request->input('permissions', []));

        return response()->json([
            'message' => 'Rôle créé avec succès',
            'role' => $role->load('permissions')
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('role_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $role = Role::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $oldPermissions = $role->permissions->pluck('title')->toArray();

        $role->update($request->all());
        $role->permissions()->sync($request->input('permissions', []));

        $newPermissions = Permission::whereIn('id', $request->input('permissions', []))->pluck('title')->toArray();

        // Log permissions change
        AuditLog::create([
            'description'  => 'audit:updated',
            'subject_id'   => $role->id,
            'subject_type' => Role::class,
            'user_id'      => auth()->id(),
            'properties'   => [
                'role' => $role->title,
                'old_permissions' => $oldPermissions,
                'new_permissions' => $newPermissions,
            ],
            'host'         => request()->ip(),
        ]);

        return response()->json([
            'message' => 'Rôle mis à jour',
            'role' => $role->load('permissions')
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('role_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $role = Role::findOrFail($id);
        if ($role->id === 1) {
            return response()->json(['message' => 'Impossible de supprimer le rôle Admin'], 403);
        }

        $roleName = $role->title;
        $role->delete();

        return response()->json(['message' => 'Rôle supprimé']);
    }
}

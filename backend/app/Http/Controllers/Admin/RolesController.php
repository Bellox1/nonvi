<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassDestroyRoleRequest;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\AuditLog;
use Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RolesController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('role_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $roles = Role::with(['permissions'])->get();

        return view('admin.roles.index', compact('roles'));
    }

    public function create()
    {
        abort_if(Gate::denies('role_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $permissions = Permission::pluck('title', 'id');

        return view('admin.roles.create', compact('permissions'));
    }

    public function store(StoreRoleRequest $request)
    {
        $role = Role::create($request->all());
        $role->permissions()->sync($request->input('permissions', []));

        // Log d'audit
        AuditLog::create([
            'description' => 'create',
            'subject_id' => $role->id,
            'subject_type' => Role::class,
            'user_id' => Auth::id(),
            'properties' => json_encode([
                'role' => $role->toArray(),
                'permissions' => $role->permissions->pluck('id'),
            ]),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.roles.index');
    }

    public function edit(Role $role)
    {
        abort_if(Gate::denies('role_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $permissions = Permission::pluck('title', 'id');

        $role->load('permissions');

        return view('admin.roles.edit', compact('permissions', 'role'));
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $role->update($request->all());
        $role->permissions()->sync($request->input('permissions', []));

        // Log d'audit
        AuditLog::create([
            'description' => 'update',
            'subject_id' => $role->id,
            'subject_type' => Role::class,
            'user_id' => Auth::id(),
            'properties' => json_encode([
                'role' => $role->toArray(),
                'permissions' => $role->permissions->pluck('id'),
            ]),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.roles.index');
    }

    public function show(Role $role)
    {
        abort_if(Gate::denies('role_show'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $role->load('permissions');

        return view('admin.roles.show', compact('role'));
    }

    public function destroy(Role $role)
    {
        abort_if(Gate::denies('role_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $roleId = $role->id;
        $roleData = $role->toArray();
        $permissions = $role->permissions->pluck('id');

        $role->delete();

        // Log d'audit
        AuditLog::create([
            'description' => 'delete',
            'subject_id' => $roleId,
            'subject_type' => Role::class,
            'user_id' => Auth::id(),
            'properties' => json_encode([
                'role' => $roleData,
                'permissions' => $permissions,
            ]),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return back();
    }

    public function massDestroy(MassDestroyRoleRequest $request)
    {
        $roles = Role::with('permissions')->find(request('ids'));

        foreach ($roles as $role) {
            $roleId = $role->id;
            $roleData = $role->toArray();
            $permissions = $role->permissions->pluck('id');

            $role->delete();

            // Log d'audit
            AuditLog::create([
                'description'   => 'mass_delete',
                'subject_id' => $roleId,
                'subject_type' => Role::class,
                'user_id' => Auth::id(),
                'properties' => json_encode([
                    'role' => $roleData,
                    'permissions' => $permissions,
                ]),
                'host' => request()->ip(),
                'created_at' => now(),
            ]);
        }

        return response(null, Response::HTTP_NO_CONTENT);
    }
}

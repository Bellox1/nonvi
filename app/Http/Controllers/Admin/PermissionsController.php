<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassDestroyPermissionRequest;
use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use App\Models\Permission;
use App\Models\AuditLog;
use Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PermissionsController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('permission_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $permissions = Permission::all();

        return view('admin.permissions.index', compact('permissions'));
    }

    public function create()
    {
        abort_if(Gate::denies('permission_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.permissions.create');
    }

    public function store(StorePermissionRequest $request)
    {
        $permission = Permission::create($request->all());

        AuditLog::create([
            'description' => 'create',
            'subject_id' => $permission->id,
            'subject_type' => Permission::class,
            'user_id' => Auth::id(),
            'properties' => json_encode($permission->toArray()),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.permissions.index');
    }

    public function edit(Permission $permission)
    {
        abort_if(Gate::denies('permission_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.permissions.edit', compact('permission'));
    }

    public function update(UpdatePermissionRequest $request, Permission $permission)
    {
        $old = $permission->toArray();
        $permission->update($request->all());

        AuditLog::create([
            'description' => 'update',
            'subject_id' => $permission->id,
            'subject_type' => Permission::class,
            'user_id' => Auth::id(),
            'properties' => json_encode([
                'before' => $old,
                'after' => $permission->toArray()
            ]),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.permissions.index');
    }

    public function show(Permission $permission)
    {
        abort_if(Gate::denies('permission_show'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.permissions.show', compact('permission'));
    }

    public function destroy(Permission $permission)
    {
        abort_if(Gate::denies('permission_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $id = $permission->id;
        $deletedData = $permission->toArray();
        $permission->delete();

        AuditLog::create([
            'description' => 'delete',
            'subject_id' => $id,
            'subject_type' => Permission::class,
            'user_id' => Auth::id(),
            'properties' => json_encode($deletedData),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return back();
    }

    public function massDestroy(MassDestroyPermissionRequest $request)
    {
        $permissions = Permission::find(request('ids'));

        foreach ($permissions as $permission) {
            $id = $permission->id;
            $deletedData = $permission->toArray();
            $permission->delete();

            AuditLog::create([
                'description'   => 'mass_delete',
                'subject_id' => $id,
                'subject_type' => Permission::class,
                'user_id' => Auth::id(),
                'properties' => json_encode($deletedData),
                'host' => request()->ip(),
                'created_at' => now(),
            ]);
        }

        return response(null, Response::HTTP_NO_CONTENT);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassDestroyUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\Station;
use App\Models\User;
use App\Models\AuditLog;
use Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UsersController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('user_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $users = User::with(['roles', 'station'])->get();

        return view('admin.users.index', compact('users'));
    }

    public function create()
    {
        abort_if(Gate::denies('user_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $roles = Role::pluck('title', 'id');
        $stations = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');

        return view('admin.users.create', compact('roles', 'stations'));
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->all());
        $user->roles()->sync($request->input('roles', []));

        // Log d'audit
        AuditLog::create([
            'description' => 'create',
            'subject_id' => $user->id,
            'subject_type' => User::class,
            'user_id' => Auth::id(),
            'properties' => json_encode($user->toArray()),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.users.index');
    }

    public function edit(User $user)
    {
        abort_if(Gate::denies('user_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $roles = Role::pluck('title', 'id');
        $stations = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');

        $user->load('roles', 'station');

        return view('admin.users.edit', compact('roles', 'stations', 'user'));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->all());
        $user->roles()->sync($request->input('roles', []));

        // Log d'audit
        AuditLog::create([
            'description' => 'update',
            'subject_id' => $user->id,
            'subject_type' => User::class,
            'user_id' => Auth::id(),
            'properties' => json_encode($user->toArray()),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.users.index');
    }

    public function show(User $user)
    {
        abort_if(Gate::denies('user_show'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $user->load('roles', 'station');

        return view('admin.users.show', compact('user'));
    }

    public function destroy(User $user)
    {
        abort_if(Gate::denies('user_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $userId = $user->id;
        $userData = $user->toArray();
        $user->delete();

        // Log d'audit
        AuditLog::create([
            'description' => 'delete',
            'subject_id' => $userId,
            'subject_type' => User::class,
            'user_id' => Auth::id(),
            'properties' => json_encode($userData),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return back();
    }

    public function massDestroy(MassDestroyUserRequest $request)
    {
        $users = User::find(request('ids'));

        foreach ($users as $user) {
            $userId = $user->id;
            $userData = $user->toArray();
            $user->delete();

            // Log d'audit pour chaque suppression
            AuditLog::create([
               'description'   => 'mass_delete',
                'subject_id' => $userId,
                'subject_type' => User::class,
                'user_id' => Auth::id(),
                'properties' => json_encode($userData),
                'host' => request()->ip(),
                'created_at' => now(),
            ]);
        }

        return response(null, Response::HTTP_NO_CONTENT);
    }
}

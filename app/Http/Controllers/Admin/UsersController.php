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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;


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
        $data = $request->all();
        $data['login_token'] = Str::random(60);
        $user = User::create($data);
        $user->roles()->sync($request->input('roles', []));

        $this->generateQrCode($user);

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
    $data = $request->all();

    // Toujours générer un nouveau token à chaque modification
    $data['login_token'] = Str::random(60);

    $user->update($data);
    $user->roles()->sync($request->input('roles', []));

    $this->generateQrCode($user);

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

        $loginLink = url("/admin/{$user->name}/{$user->id}/{$user->login_token}");
        $qrCodePath = Storage::disk('public')->exists("qrcodes/{$user->id}.png")
            ? asset("storage/qrcodes/{$user->id}.png")
            : null;

        return view('admin.users.show', compact('user', 'loginLink', 'qrCodePath'));
    }

    public function destroy(User $user)
    {
        abort_if(Gate::denies('user_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $this->deleteQrCode($user->id);

        $userId = $user->id;
        $userData = $user->toArray();
        $user->delete();

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
            $this->deleteQrCode($user->id);

            $userId = $user->id;
            $userData = $user->toArray();
            $user->delete();

            AuditLog::create([
                'description' => 'mass_delete',
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

private function generateQrCode(User $user)
{
    if (!$user->login_token) {
        $user->login_token = Str::random(60);
        $user->save();
    }

    $link = url("/admin/{$user->name}/{$user->id}/{$user->login_token}");
    $path = storage_path("app/public/qrcodes/{$user->id}.png");

    $result = Builder::create()
        ->writer(new PngWriter())
        ->data($link)
        ->size(300)
        ->margin(10)
        ->build();

    // Enregistrer le fichier
    $result->saveToFile($path);
}
    private function deleteQrCode($userId)
    {
        $filename = "qrcodes/{$userId}.png";

        if (Storage::disk('public')->exists($filename)) {
            Storage::disk('public')->delete($filename);
        }
    }
    public function showCard($id, $name)
{
    // Chercher l'utilisateur par ID
    $user = User::findOrFail($id);

    // Optionnel : vérifier que le nom dans l'URL correspond bien à l'utilisateur pour éviter erreur ou manipulation
    if ($user->name !== $name) {
        abort(404); // ou rediriger, selon ce que tu veux faire
    }

    return view('admin.users.carte', compact('user'));
}

}

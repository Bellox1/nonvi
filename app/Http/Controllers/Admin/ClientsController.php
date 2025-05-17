<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassDestroyClientRequest;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Gate;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AuditLog;

class ClientsController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('client_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $clients = Client::all();

        return view('admin.clients.index', compact('clients'));
    }

    public function create()
    {
        abort_if(Gate::denies('client_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.clients.create');
    }

    public function store(StoreClientRequest $request)
    {
        $client = Client::create($request->all());

        AuditLog::create([
            'description' => 'create',
            'subject_id' => $client->id,
            'subject_type' => Client::class,
            'user_id' => auth()->id(),
            'properties' => json_encode(['new' => $client->toArray()]),
            'host' => $request->ip(),
        ]);

        return redirect()->route('admin.clients.index');
    }

    public function edit(Client $client)
    {
        abort_if(Gate::denies('client_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.clients.edit', compact('client'));
    }

    public function update(UpdateClientRequest $request, Client $client)
    {
        $old = $client->toArray();

        $client->update($request->all());

        AuditLog::create([
            'description' => 'update',
            'subject_id' => $client->id,
            'subject_type' => Client::class,
            'user_id' => auth()->id(),
            'properties' => json_encode(['old' => $old, 'new' => $client->toArray()]),
            'host' => $request->ip(),
        ]);

        return redirect()->route('admin.clients.index');
    }

    public function show(Client $client)
    {
        abort_if(Gate::denies('client_show'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.clients.show', compact('client'));
    }

    public function destroy(Request $request, Client $client)
    {
        abort_if(Gate::denies('client_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $old = $client->toArray();

        $client->delete();

        AuditLog::create([
            'description' => 'delete',
            'subject_id' => $client->id,
            'subject_type' => Client::class,
            'user_id' => auth()->id(),
            'properties' => json_encode(['old' => $old]),
            'host' => $request->ip(),
        ]);

        return back();
    }

    public function massDestroy(MassDestroyClientRequest $request)
    {
        $clients = Client::find($request->ids);

        foreach ($clients as $client) {
            $old = $client->toArray();
            $id = $client->id;
            $client->delete();

            AuditLog::create([
                'description' => 'delete',
                'subject_id' => $id,
                'subject_type' => Client::class,
                'user_id' => auth()->id(),
                'properties' => json_encode(['old' => $old]),
                'host' => $request->ip(),
            ]);
        }

        return response(null, Response::HTTP_NO_CONTENT);
    }
}

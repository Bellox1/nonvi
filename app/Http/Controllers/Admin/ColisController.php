<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassDestroyColiRequest;
use App\Http\Requests\StoreColiRequest;
use App\Http\Requests\UpdateColiRequest;
use App\Models\Client;
use App\Models\Coli;
use App\Models\Station;
use App\Models\User;
use App\Models\AuditLog;
use Gate;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ColisController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('coli_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $colis = Coli::with(['station_depart', 'station_arrivee', 'user', 'expediteur'])->get();

        return view('admin.colis.index', compact('colis'));
    }

    public function create()
    {
        abort_if(Gate::denies('coli_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $station_departs = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');
        $station_arrivees = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');
        $users = User::pluck('name', 'id')->prepend(trans('global.pleaseSelect'), '');
        $expediteurs = Client::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');

        return view('admin.colis.create', compact('expediteurs', 'station_arrivees', 'station_departs', 'users'));
    }

    public function store(StoreColiRequest $request)
    {
        $coli = Coli::create($request->all());

        AuditLog::create([
            'description'   => 'create',
            'subject_type'  => Coli::class,
            'subject_id'    => $coli->id,
            'user_id'       => auth()->id(),
            'properties'    => json_encode(['new' => $coli->toArray()]),
            'host'          => $request->ip(),
        ]);

        return redirect()->route('admin.colis.index');
    }

    public function edit(Coli $coli)
    {
        abort_if(Gate::denies('coli_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $station_departs = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');
        $station_arrivees = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');
        $users = User::pluck('name', 'id')->prepend(trans('global.pleaseSelect'), '');
        $expediteurs = Client::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');

        $coli->load('station_depart', 'station_arrivee', 'user', 'expediteur');

        return view('admin.colis.edit', compact('coli', 'expediteurs', 'station_arrivees', 'station_departs', 'users'));
    }

    public function update(UpdateColiRequest $request, Coli $coli)
    {
        $old = $coli->toArray();
        $coli->update($request->all());

        AuditLog::create([
            'description'   => 'update',
            'subject_type'  => Coli::class,
            'subject_id'    => $coli->id,
            'user_id'       => auth()->id(),
            'properties'    => json_encode(['old' => $old, 'new' => $coli->toArray()]),
            'host'          => $request->ip(),
        ]);

        return redirect()->route('admin.colis.index');
    }

    public function show(Coli $coli)
    {
        abort_if(Gate::denies('coli_show'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $coli->load('station_depart', 'station_arrivee', 'user', 'expediteur');

        return view('admin.colis.show', compact('coli'));
    }

    public function destroy(Request $request, Coli $coli)
    {
        abort_if(Gate::denies('coli_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $old = $coli->toArray();
        $id = $coli->id;
        $coli->delete();

        AuditLog::create([
            'description'   => 'delete',
            'subject_type'  => Coli::class,
            'subject_id'    => $id,
            'user_id'       => auth()->id(),
            'properties'    => json_encode(['old' => $old]),
            'host'          => $request->ip(),
        ]);

        return back();
    }

    public function massDestroy(MassDestroyColiRequest $request)
    {
        $colis = Coli::find(request('ids'));

        foreach ($colis as $coli) {
            $old = $coli->toArray();
            $id = $coli->id;
            $coli->delete();

            AuditLog::create([
                'description'   => 'mass_delete',
                'subject_type'  => Coli::class,
                'subject_id'    => $id,
                'user_id'       => auth()->id(),
                'properties'    => json_encode(['old' => $old]),
                'host'          => $request->ip(),
            ]);
        }

        return response(null, Response::HTTP_NO_CONTENT);
    }
}

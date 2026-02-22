<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassDestroyStationRequest;
use App\Http\Requests\StoreStationRequest;
use App\Http\Requests\UpdateStationRequest;
use App\Models\Station;
use App\Models\AuditLog;
use Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class StationsController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('station_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $stations = Station::all();

        return view('admin.stations.index', compact('stations'));
    }

    public function create()
    {
        abort_if(Gate::denies('station_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.stations.create');
    }

    public function store(StoreStationRequest $request)
    {
        $station = Station::create($request->all());

        // Log d'audit
        AuditLog::create([
            'description' => 'create',
            'subject_id' => $station->id,
            'subject_type' => Station::class,
            'user_id' => Auth::id(),
            'properties' => json_encode($station->toArray()),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.stations.index');
    }

    public function edit(Station $station)
    {
        abort_if(Gate::denies('station_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.stations.edit', compact('station'));
    }

    public function update(UpdateStationRequest $request, Station $station)
    {
        $station->update($request->all());

        // Log d'audit
        AuditLog::create([
            'description' => 'update',
            'subject_id' => $station->id,
            'subject_type' => Station::class,
            'user_id' => Auth::id(),
            'properties' => json_encode($station->toArray()),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.stations.index');
    }

    public function show(Station $station)
    {
        abort_if(Gate::denies('station_show'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.stations.show', compact('station'));
    }

    public function destroy(Station $station)
    {
        abort_if(Gate::denies('station_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $stationId = $station->id;
        $stationData = $station->toArray();
        $station->delete();

        // Log d'audit
        AuditLog::create([
            'description' => 'delete',
            'subject_id' => $stationId,
            'subject_type' => Station::class,
            'user_id' => Auth::id(),
            'properties' => json_encode($stationData),
            'host' => request()->ip(),
            'created_at' => now(),
        ]);

        return back();
    }

    public function massDestroy(MassDestroyStationRequest $request)
    {
        $stations = Station::find(request('ids'));

        foreach ($stations as $station) {
            $stationId = $station->id;
            $stationData = $station->toArray();
            $station->delete();

            // Log d'audit
            AuditLog::create([
                'description'   => 'mass_delete',
                'subject_id' => $stationId,
                'subject_type' => Station::class,
                'user_id' => Auth::id(),
                'properties' => json_encode($stationData),
                'host' => request()->ip(),
                'created_at' => now(),
            ]);
        }

        return response(null, Response::HTTP_NO_CONTENT);
    }
}

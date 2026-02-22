<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassDestroyReservationRequest;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Models\Client;
use App\Models\Reservation;
use App\Models\Station;
use App\Models\User;
use App\Models\AuditLog;
use Gate;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReservationsController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('reservation_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $reservations = Reservation::with(['client', 'user', 'station_depart', 'station_arrivee'])->get();

        return view('admin.reservations.index', compact('reservations'));
    }

    public function create()
    {
        abort_if(Gate::denies('reservation_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $clients = Client::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');
        $users = User::pluck('name', 'id')->prepend(trans('global.pleaseSelect'), '');
        $station_departs = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');
        $station_arrivees = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');

        return view('admin.reservations.create', compact('clients', 'station_arrivees', 'station_departs', 'users'));
    }

    public function store(StoreReservationRequest $request)
    {
        $data = $request->all();
        $data['statut'] = 'en_attente';

        $reservation = Reservation::create($data);

        AuditLog::create([
            'description' => 'create',
            'subject_type'  => 'Reservation',
            'subject_id'    => $reservation->id,
            'user_id'       => auth()->id(),
            'properties'    => json_encode($reservation->toArray()),
            'host'          => request()->ip(),
        ]);

        return redirect()->route('admin.reservations.index');
    }

    public function edit(Reservation $reservation)
    {
        abort_if(Gate::denies('reservation_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $clients = Client::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');
        $users = User::pluck('name', 'id')->prepend(trans('global.pleaseSelect'), '');
        $station_departs = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');
        $station_arrivees = Station::pluck('nom', 'id')->prepend(trans('global.pleaseSelect'), '');

        $reservation->load('client', 'user', 'station_depart', 'station_arrivee');

        return view('admin.reservations.edit', compact('clients', 'reservation', 'station_arrivees', 'station_departs', 'users'));
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation)
    {
        $oldData = $reservation->toArray();

        $reservation->update($request->all());

        $newData = $reservation->toArray();
        $changes = [
            'before' => $oldData,
            'after'  => $newData,
        ];

        AuditLog::create([
            'description' => 'update',
            'subject_type'  => 'Reservation',
            'subject_id'    => $reservation->id,
            'user_id'       => auth()->id(),
            'properties'    => json_encode($changes),
            'host'          => request()->ip(),
        ]);

        return redirect()->route('admin.reservations.index');
    }

    public function show(Reservation $reservation)
    {
        abort_if(Gate::denies('reservation_show'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $reservation->load('client', 'user', 'station_depart', 'station_arrivee');

        return view('admin.reservations.show', compact('reservation'));
    }

    public function destroy(Reservation $reservation)
    {
        abort_if(Gate::denies('reservation_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $id = $reservation->id;
        $data = $reservation->toArray();

        $reservation->delete();

        AuditLog::create([
            'description' => 'delete',
            'subject_type'  => 'Reservation',
            'subject_id'    => $id,
            'user_id'       => auth()->id(),
            'properties'    => json_encode($data),
            'host'          => request()->ip(),
        ]);

        return back();
    }

    public function massDestroy(MassDestroyReservationRequest $request)
    {
        $reservations = Reservation::find(request('ids'));

        foreach ($reservations as $reservation) {
            $id = $reservation->id;
            $data = $reservation->toArray();

            $reservation->delete();

            AuditLog::create([
                'description'   => 'mass_delete',
                'subject_type'  => 'Reservation',
                'subject_id'    => $id,
                'user_id'       => auth()->id(),
                'properties'    => json_encode($data),
                'host'          => request()->ip(),
            ]);
        }

        return response(null, Response::HTTP_NO_CONTENT);
    }
}

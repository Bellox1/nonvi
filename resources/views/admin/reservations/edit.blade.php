@extends('layouts.admin')
@section('content')

<div class="card">
    <div class="card-header">
        {{ trans('global.edit') }} {{ trans('cruds.reservation.title_singular') }}
    </div>

    <div class="card-body">
        <form method="POST" action="{{ route("admin.reservations.update", [$reservation->id]) }}" enctype="multipart/form-data">
            @method('PUT')
            @csrf
            <div class="form-group">
                <label class="required" for="heure_depart">{{ trans('cruds.reservation.fields.heure_depart') }}</label>
                <input class="form-control timepicker {{ $errors->has('heure_depart') ? 'is-invalid' : '' }}" type="text" name="heure_depart" id="heure_depart" value="{{ old('heure_depart', $reservation->heure_depart) }}" required>
                @if($errors->has('heure_depart'))
                    <div class="invalid-feedback">
                        {{ $errors->first('heure_depart') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.heure_depart_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="nombre_tickets">{{ trans('cruds.reservation.fields.nombre_tickets') }}</label>
                <input class="form-control {{ $errors->has('nombre_tickets') ? 'is-invalid' : '' }}" type="text" name="nombre_tickets" id="nombre_tickets" value="{{ old('nombre_tickets', $reservation->nombre_tickets) }}" required>
                @if($errors->has('nombre_tickets'))
                    <div class="invalid-feedback">
                        {{ $errors->first('nombre_tickets') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.nombre_tickets_helper') }}</span>
            </div>
            <div class="form-group">
                <label>{{ trans('cruds.reservation.fields.moyen_paiement') }}</label>
                <select class="form-control {{ $errors->has('moyen_paiement') ? 'is-invalid' : '' }}" name="moyen_paiement" id="moyen_paiement">
                    <option value disabled {{ old('moyen_paiement', null) === null ? 'selected' : '' }}>{{ trans('global.pleaseSelect') }}</option>
                    @foreach(App\Models\Reservation::MOYEN_PAIEMENT_SELECT as $key => $label)
                        <option value="{{ $key }}" {{ old('moyen_paiement', $reservation->moyen_paiement) === (string) $key ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
                @if($errors->has('moyen_paiement'))
                    <div class="invalid-feedback">
                        {{ $errors->first('moyen_paiement') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.moyen_paiement_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required">{{ trans('cruds.reservation.fields.statut') }}</label>
                <select class="form-control {{ $errors->has('statut') ? 'is-invalid' : '' }}" name="statut" id="statut" required>
                    <option value disabled {{ old('statut', null) === null ? 'selected' : '' }}>{{ trans('global.pleaseSelect') }}</option>
                    @foreach(App\Models\Reservation::STATUT_SELECT as $key => $label)
                        <option value="{{ $key }}" {{ old('statut', $reservation->statut) === (string) $key ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
                @if($errors->has('statut'))
                    <div class="invalid-feedback">
                        {{ $errors->first('statut') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.statut_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="client_id">{{ trans('cruds.reservation.fields.client') }}</label>
                <select class="form-control select2 {{ $errors->has('client') ? 'is-invalid' : '' }}" name="client_id" id="client_id" required>
                    @foreach($clients as $id => $entry)
                        <option value="{{ $id }}" {{ (old('client_id') ? old('client_id') : $reservation->client->id ?? '') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('client'))
                    <div class="invalid-feedback">
                        {{ $errors->first('client') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.client_helper') }}</span>
            </div>
            <div class="form-group">
                <label for="user_id">{{ trans('cruds.reservation.fields.user') }}</label>
                <select class="form-control select2 {{ $errors->has('user') ? 'is-invalid' : '' }}" name="user_id" id="user_id">
                    @foreach($users as $id => $entry)
                        <option value="{{ $id }}" {{ (old('user_id') ? old('user_id') : $reservation->user->id ?? '') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('user'))
                    <div class="invalid-feedback">
                        {{ $errors->first('user') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.user_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="station_depart_id">{{ trans('cruds.reservation.fields.station_depart') }}</label>
                <select class="form-control select2 {{ $errors->has('station_depart') ? 'is-invalid' : '' }}" name="station_depart_id" id="station_depart_id" required>
                    @foreach($station_departs as $id => $entry)
                        <option value="{{ $id }}" {{ (old('station_depart_id') ? old('station_depart_id') : $reservation->station_depart->id ?? '') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('station_depart'))
                    <div class="invalid-feedback">
                        {{ $errors->first('station_depart') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.station_depart_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="station_arrivee_id">{{ trans('cruds.reservation.fields.station_arrivee') }}</label>
                <select class="form-control select2 {{ $errors->has('station_arrivee') ? 'is-invalid' : '' }}" name="station_arrivee_id" id="station_arrivee_id" required>
                    @foreach($station_arrivees as $id => $entry)
                        <option value="{{ $id }}" {{ (old('station_arrivee_id') ? old('station_arrivee_id') : $reservation->station_arrivee->id ?? '') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('station_arrivee'))
                    <div class="invalid-feedback">
                        {{ $errors->first('station_arrivee') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.station_arrivee_helper') }}</span>
            </div>
            <div class="form-group">
                <button class="btn btn-danger" type="submit">
                    {{ trans('global.save') }}
                </button>
            </div>
        </form>
    </div>
</div>



@endsection
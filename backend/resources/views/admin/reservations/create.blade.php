@extends('layouts.admin')
@section('content')

<div class="card">
    <div class="card-header">
        {{ trans('global.create') }} {{ trans('cruds.reservation.title_singular') }}
    </div>

    <div class="card-body">
        <form method="POST" action="{{ route("admin.reservations.store") }}" enctype="multipart/form-data">
            @csrf

            {{-- Heure de départ --}}
            <div class="form-group">
                <label class="required" for="heure_depart">{{ trans('cruds.reservation.fields.heure_depart') }}</label>
                <select class="form-control {{ $errors->has('heure_depart') ? 'is-invalid' : '' }}" name="heure_depart" id="heure_depart" required>
                    <option value disabled {{ old('heure_depart') === null ? 'selected' : '' }}>{{ trans('global.pleaseSelect') }}</option>
                    @foreach(\App\Models\Reservation::HEURE_DEPART_SELECT as $key => $label)
                        <option value="{{ $key }}" {{ old('heure_depart') == $key ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
                @if($errors->has('heure_depart'))
                    <div class="invalid-feedback">
                        {{ $errors->first('heure_depart') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.heure_depart_helper') }}</span>
            </div>

            {{-- Nombre de tickets --}}
            <div class="form-group">
    <label class="required" for="nombre_tickets">{{ trans('cruds.reservation.fields.nombre_tickets') }}</label>
    <input 
        class="form-control {{ $errors->has('nombre_tickets') ? 'is-invalid' : '' }}" 
        type="number" 
        name="nombre_tickets" 
        id="nombre_tickets" 
        value="{{ old('nombre_tickets', 1) }}" 
        min="1" 
        required
    >
    @if($errors->has('nombre_tickets'))
        <div class="invalid-feedback">
            {{ $errors->first('nombre_tickets') }}
        </div>
    @endif
    <span class="help-block">{{ trans('cruds.reservation.fields.nombre_tickets_helper') }}</span>
</div>


            {{-- Moyen de paiement --}}
            <div class="form-group">
                <label class="required">{{ trans('cruds.reservation.fields.moyen_paiement') }}</label>
                <select class="form-control {{ $errors->has('moyen_paiement') ? 'is-invalid' : '' }}" name="moyen_paiement" id="moyen_paiement" required>
                    <option value disabled {{ old('moyen_paiement') === null ? 'selected' : '' }}>{{ trans('global.pleaseSelect') }}</option>
                    @foreach(\App\Models\Reservation::MOYEN_PAIEMENT_SELECT as $key => $label)
                        <option value="{{ $key }}" {{ old('moyen_paiement') === $key ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
                @if($errors->has('moyen_paiement'))
                    <div class="invalid-feedback">
                        {{ $errors->first('moyen_paiement') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.moyen_paiement_helper') }}</span>
            </div>

            {{-- Client --}}
            <div class="form-group">
                <label class="required" for="client_id">{{ trans('cruds.reservation.fields.client') }}</label>
                <select class="form-control select2 {{ $errors->has('client_id') ? 'is-invalid' : '' }}" name="client_id" id="client_id" required>
                    @foreach($clients as $id => $entry)
                        <option value="{{ $id }}" {{ old('client_id') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('client_id'))
                    <div class="invalid-feedback">
                        {{ $errors->first('client_id') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.client_helper') }}</span>
            </div>

            {{-- User --}}
            <div class="form-group">
                <label for="user_id">{{ trans('cruds.reservation.fields.user') }}</label>
                <select class="form-control select2 {{ $errors->has('user_id') ? 'is-invalid' : '' }}" name="user_id" id="user_id">
                    @foreach($users as $id => $entry)
                        <option value="{{ $id }}" {{ old('user_id') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('user_id'))
                    <div class="invalid-feedback">
                        {{ $errors->first('user_id') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.user_helper') }}</span>
            </div>

            {{-- Station de départ --}}
            <div class="form-group">
                <label class="required" for="station_depart_id">{{ trans('cruds.reservation.fields.station_depart') }}</label>
                <select class="form-control select2 {{ $errors->has('station_depart_id') ? 'is-invalid' : '' }}" name="station_depart_id" id="station_depart_id" required>
                    @foreach($station_departs as $id => $entry)
                        <option value="{{ $id }}" {{ old('station_depart_id') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('station_depart_id'))
                    <div class="invalid-feedback">
                        {{ $errors->first('station_depart_id') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.station_depart_helper') }}</span>
            </div>

            {{-- Station d’arrivée --}}
            <div class="form-group">
                <label class="required" for="station_arrivee_id">{{ trans('cruds.reservation.fields.station_arrivee') }}</label>
                <select class="form-control select2 {{ $errors->has('station_arrivee_id') ? 'is-invalid' : '' }}" name="station_arrivee_id" id="station_arrivee_id" required>
                    @foreach($station_arrivees as $id => $entry)
                        <option value="{{ $id }}" {{ old('station_arrivee_id') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('station_arrivee_id'))
                    <div class="invalid-feedback">
                        {{ $errors->first('station_arrivee_id') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.reservation.fields.station_arrivee_helper') }}</span>
            </div>

            {{-- Bouton enregistrer --}}
            <div class="form-group">
                <button class="btn btn-danger" type="submit">
                    {{ trans('global.save') }}
                </button>
            </div>
        </form>
    </div>
</div>

@endsection

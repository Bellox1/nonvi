@extends('layouts.admin')
@section('content')

<div class="card">
    <div class="card-header">
        {{ trans('global.edit') }} {{ trans('cruds.coli.title_singular') }}
    </div>

    <div class="card-body">
        <form method="POST" action="{{ route("admin.colis.update", [$coli->id]) }}" enctype="multipart/form-data">
            @method('PUT')
            @csrf
            <div class="form-group">
                <label class="required" for="destinataire_nom">{{ trans('cruds.coli.fields.destinataire_nom') }}</label>
                <input class="form-control {{ $errors->has('destinataire_nom') ? 'is-invalid' : '' }}" type="text" name="destinataire_nom" id="destinataire_nom" value="{{ old('destinataire_nom', $coli->destinataire_nom) }}" required>
                @if($errors->has('destinataire_nom'))
                    <div class="invalid-feedback">
                        {{ $errors->first('destinataire_nom') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.destinataire_nom_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="destinataire_tel">{{ trans('cruds.coli.fields.destinataire_tel') }}</label>
                <input class="form-control {{ $errors->has('destinataire_tel') ? 'is-invalid' : '' }}" type="text" name="destinataire_tel" id="destinataire_tel" value="{{ old('destinataire_tel', $coli->destinataire_tel) }}" required>
                @if($errors->has('destinataire_tel'))
                    <div class="invalid-feedback">
                        {{ $errors->first('destinataire_tel') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.destinataire_tel_helper') }}</span>
            </div>
            <div class="form-group">
                <label for="prix">{{ trans('cruds.coli.fields.prix') }}</label>
                <input class="form-control {{ $errors->has('prix') ? 'is-invalid' : '' }}" type="number" name="prix" id="prix" value="{{ old('prix', $coli->prix) }}" step="0.01">
                @if($errors->has('prix'))
                    <div class="invalid-feedback">
                        {{ $errors->first('prix') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.prix_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="heure_envoi">{{ trans('cruds.coli.fields.heure_envoi') }}</label>
                <input class="form-control timepicker {{ $errors->has('heure_envoi') ? 'is-invalid' : '' }}" type="text" name="heure_envoi" id="heure_envoi" value="{{ old('heure_envoi', $coli->heure_envoi) }}" required>
                @if($errors->has('heure_envoi'))
                    <div class="invalid-feedback">
                        {{ $errors->first('heure_envoi') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.heure_envoi_helper') }}</span>
            </div>
            <div class="form-group">
                <label for="heure_retrait">{{ trans('cruds.coli.fields.heure_retrait') }}</label>
                <input class="form-control timepicker {{ $errors->has('heure_retrait') ? 'is-invalid' : '' }}" type="text" name="heure_retrait" id="heure_retrait" value="{{ old('heure_retrait', $coli->heure_retrait) }}">
                @if($errors->has('heure_retrait'))
                    <div class="invalid-feedback">
                        {{ $errors->first('heure_retrait') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.heure_retrait_helper') }}</span>
            </div>
            <div class="form-group">
                <label>{{ trans('cruds.coli.fields.statut') }}</label>
                <select class="form-control {{ $errors->has('statut') ? 'is-invalid' : '' }}" name="statut" id="statut">
                    <option value disabled {{ old('statut', null) === null ? 'selected' : '' }}>{{ trans('global.pleaseSelect') }}</option>
                    @foreach(App\Models\Coli::STATUT_SELECT as $key => $label)
                        <option value="{{ $key }}" {{ old('statut', $coli->statut) === (string) $key ? 'selected' : '' }}>{{ $label }}</option>
                    @endforeach
                </select>
                @if($errors->has('statut'))
                    <div class="invalid-feedback">
                        {{ $errors->first('statut') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.statut_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="station_depart_id">{{ trans('cruds.coli.fields.station_depart') }}</label>
                <select class="form-control select2 {{ $errors->has('station_depart') ? 'is-invalid' : '' }}" name="station_depart_id" id="station_depart_id" required>
                    @foreach($station_departs as $id => $entry)
                        <option value="{{ $id }}" {{ (old('station_depart_id') ? old('station_depart_id') : $coli->station_depart->id ?? '') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('station_depart'))
                    <div class="invalid-feedback">
                        {{ $errors->first('station_depart') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.station_depart_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="station_arrivee_id">{{ trans('cruds.coli.fields.station_arrivee') }}</label>
                <select class="form-control select2 {{ $errors->has('station_arrivee') ? 'is-invalid' : '' }}" name="station_arrivee_id" id="station_arrivee_id" required>
                    @foreach($station_arrivees as $id => $entry)
                        <option value="{{ $id }}" {{ (old('station_arrivee_id') ? old('station_arrivee_id') : $coli->station_arrivee->id ?? '') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('station_arrivee'))
                    <div class="invalid-feedback">
                        {{ $errors->first('station_arrivee') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.station_arrivee_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="user_id">{{ trans('cruds.coli.fields.user') }}</label>
                <select class="form-control select2 {{ $errors->has('user') ? 'is-invalid' : '' }}" name="user_id" id="user_id" required>
                    @foreach($users as $id => $entry)
                        <option value="{{ $id }}" {{ (old('user_id') ? old('user_id') : $coli->user->id ?? '') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('user'))
                    <div class="invalid-feedback">
                        {{ $errors->first('user') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.user_helper') }}</span>
            </div>
            <div class="form-group">
                <label class="required" for="expediteur_id">{{ trans('cruds.coli.fields.expediteur') }}</label>
                <select class="form-control select2 {{ $errors->has('expediteur') ? 'is-invalid' : '' }}" name="expediteur_id" id="expediteur_id" required>
                    @foreach($expediteurs as $id => $entry)
                        <option value="{{ $id }}" {{ (old('expediteur_id') ? old('expediteur_id') : $coli->expediteur->id ?? '') == $id ? 'selected' : '' }}>{{ $entry }}</option>
                    @endforeach
                </select>
                @if($errors->has('expediteur'))
                    <div class="invalid-feedback">
                        {{ $errors->first('expediteur') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.coli.fields.expediteur_helper') }}</span>
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
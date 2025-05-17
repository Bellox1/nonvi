@extends('layouts.admin')
@section('content')

<div class="card">
    <div class="card-header">
        {{ trans('global.edit') }} {{ trans('cruds.station.title_singular') }}
    </div>

    <div class="card-body">
        <form method="POST" action="{{ route("admin.stations.update", [$station->id]) }}" enctype="multipart/form-data">
            @method('PUT')
            @csrf
            <div class="form-group">
                <label class="required" for="nom">{{ trans('cruds.station.fields.nom') }}</label>
                <input class="form-control {{ $errors->has('nom') ? 'is-invalid' : '' }}" type="text" name="nom" id="nom" value="{{ old('nom', $station->nom) }}" required>
                @if($errors->has('nom'))
                    <div class="invalid-feedback">
                        {{ $errors->first('nom') }}
                    </div>
                @endif
                <span class="help-block">{{ trans('cruds.station.fields.nom_helper') }}</span>
            </div>
            <div class="form-group">
<label class="required" for="adresse">{{ trans('cruds.station.fields.adresse') }}</label>
<input class="form-control {{ $errors->has('adresse') ? 'is-invalid' : '' }}" type="text" name="adresse" id="adresse" value="{{ old('adresse', $station->adresse) }}" required>
    @if($errors->has('adresse'))
        <div class="invalid-feedback">
            {{ $errors->first('adresse') }}
        </div>
    @endif
    <span class="help-block">{{ trans('cruds.station.fields.adresse_helper') }}</span>
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
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
<label class="required" for="ville">{{ trans('cruds.station.fields.ville') }}</label>
<input class="form-control {{ $errors->has('ville') ? 'is-invalid' : '' }}" type="text" name="ville" id="ville" value="{{ old('ville', $station->ville) }}" required>
    @if($errors->has('ville'))
        <div class="invalid-feedback">
            {{ $errors->first('ville') }}
        </div>
    @endif
    <span class="help-block">{{ trans('cruds.station.fields.ville_helper') }}</span>
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
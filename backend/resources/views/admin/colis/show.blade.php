@extends('layouts.admin')
@section('content')

<div class="card">
    <div class="card-header">
        {{ trans('global.show') }} {{ trans('cruds.coli.title') }}
    </div>

    <div class="card-body">
        <div class="form-group">
            <div class="form-group">
                <a class="btn btn-default" href="{{ route('admin.colis.index') }}">
                    {{ trans('global.back_to_list') }}
                </a>
            </div>
            <table class="table table-bordered table-striped">
                <tbody>
                    <tr>
                        <th>
                            {{ trans('cruds.coli.fields.id') }}
                        </th>
                        <td>
                            {{ $coli->id }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.coli.fields.prix') }}
                        </th>
                        <td>
                            {{ $coli->prix }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.coli.fields.statut') }}
                        </th>
                        <td>
                            {{ App\Models\Coli::STATUT_SELECT[$coli->statut] ?? '' }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.coli.fields.station_depart') }}
                        </th>
                        <td>
                            {{ $coli->station_depart->nom ?? '' }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.coli.fields.station_arrivee') }}
                        </th>
                        <td>
                            {{ $coli->station_arrivee->nom ?? '' }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.coli.fields.user') }}
                        </th>
                        <td>
                            {{ $coli->user->name ?? '' }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.coli.fields.expediteur') }}
                        </th>
                        <td>
                            {{ $coli->expediteur->nom ?? '' }}
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="form-group">
                <a class="btn btn-default" href="{{ route('admin.colis.index') }}">
                    {{ trans('global.back_to_list') }}
                </a>
            </div>
        </div>
    </div>
</div>



@endsection
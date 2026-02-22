@extends('layouts.admin')
@section('content')
@can('coli_create')
    <div style="margin-bottom: 10px;" class="row">
        <div class="col-lg-12">
            <a class="btn btn-success" href="{{ route('admin.colis.create') }}">
                {{ trans('global.add') }} {{ trans('cruds.coli.title_singular') }}
            </a>
        </div>
    </div>
@endcan
<div class="card">
    <div class="card-header">
        {{ trans('cruds.coli.title_singular') }} {{ trans('global.list') }}
    </div>

    <div class="card-body">
        <div class="table-responsive">
            <table class=" table table-bordered table-striped table-hover datatable datatable-Coli">
                <thead>
                    <tr>
                        <th width="10">

                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.id') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.destinataire_nom') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.destinataire_tel') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.prix') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.heure_envoi') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.heure_retrait') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.statut') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.station_depart') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.station_arrivee') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.user') }}
                        </th>
                        <th>
                            {{ trans('cruds.coli.fields.expediteur') }}
                        </th>
                        <th>
                            &nbsp;
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($colis as $key => $coli)
                        <tr data-entry-id="{{ $coli->id }}">
                            <td>

                            </td>
                            <td>
                                {{ $coli->id ?? '' }}
                            </td>
                            <td>
                                {{ $coli->destinataire_nom ?? '' }}
                            </td>
                            <td>
                                {{ $coli->destinataire_tel ?? '' }}
                            </td>
                            <td>
                                {{ $coli->prix ?? '' }}
                            </td>
                            <td>
                                {{ $coli->heure_envoi ?? '' }}
                            </td>
                            <td>
                                {{ $coli->heure_retrait ?? '' }}
                            </td>
                            <td>
                                {{ App\Models\Coli::STATUT_SELECT[$coli->statut] ?? '' }}
                            </td>
                            <td>
                                {{ $coli->station_depart->nom ?? '' }}
                            </td>
                            <td>
                                {{ $coli->station_arrivee->nom ?? '' }}
                            </td>
                            <td>
                                {{ $coli->user->name ?? '' }}
                            </td>
                            <td>
                                {{ $coli->expediteur->nom ?? '' }}
                            </td>
                            <td>
                                @can('coli_show')
                                    <a class="btn btn-xs btn-primary" href="{{ route('admin.colis.show', $coli->id) }}">
                                        {{ trans('global.view') }}
                                    </a>
                                @endcan

                                @can('coli_edit')
                                    <a class="btn btn-xs btn-info" href="{{ route('admin.colis.edit', $coli->id) }}">
                                        {{ trans('global.edit') }}
                                    </a>
                                @endcan

                                @can('coli_delete')
                                    <form action="{{ route('admin.colis.destroy', $coli->id) }}" method="POST" onsubmit="return confirm('{{ trans('global.areYouSure') }}');" style="display: inline-block;">
                                        <input type="hidden" name="_method" value="DELETE">
                                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                                        <input type="submit" class="btn btn-xs btn-danger" value="{{ trans('global.delete') }}">
                                    </form>
                                @endcan

                            </td>

                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>



@endsection
@section('scripts')
@parent
<script>
    $(function () {
  let dtButtons = $.extend(true, [], $.fn.dataTable.defaults.buttons)
@can('coli_delete')
  let deleteButtonTrans = '{{ trans('global.datatables.delete') }}'
  let deleteButton = {
    text: deleteButtonTrans,
    url: "{{ route('admin.colis.massDestroy') }}",
    className: 'btn-danger',
    action: function (e, dt, node, config) {
      var ids = $.map(dt.rows({ selected: true }).nodes(), function (entry) {
          return $(entry).data('entry-id')
      });

      if (ids.length === 0) {
        alert('{{ trans('global.datatables.zero_selected') }}')

        return
      }

      if (confirm('{{ trans('global.areYouSure') }}')) {
        $.ajax({
          headers: {'x-csrf-token': _token},
          method: 'POST',
          url: config.url,
          data: { ids: ids, _method: 'DELETE' }})
          .done(function () { location.reload() })
      }
    }
  }
  dtButtons.push(deleteButton)
@endcan

  $.extend(true, $.fn.dataTable.defaults, {
    orderCellsTop: true,
    order: [[ 1, 'desc' ]],
    pageLength: 100,
  });
  let table = $('.datatable-Coli:not(.ajaxTable)').DataTable({ buttons: dtButtons })
  $('a[data-toggle="tab"]').on('shown.bs.tab click', function(e){
      $($.fn.dataTable.tables(true)).DataTable()
          .columns.adjust();
  });
  
})

</script>
@endsection
@extends('layouts.admin')
@section('content')
@can('produit_create')
    <div style="margin-bottom: 10px;" class="row">
        <div class="col-lg-12">
            <a class="btn btn-success" href="{{ route('admin.produits.create') }}">
                {{ trans('global.add') }} {{ trans('cruds.produit.title_singular') }}
            </a>
        </div>
    </div>
@endcan
<div class="card">
    <div class="card-header">
        {{ trans('cruds.produit.title_singular') }} {{ trans('global.list') }}
    </div>

    <div class="card-body">
        <div class="table-responsive">
            <table class=" table table-bordered table-striped table-hover datatable datatable-Produit">
                <thead>
                    <tr>
                        <th width="10">

                        </th>
                        <th>
                            {{ trans('cruds.produit.fields.id') }}
                        </th>
                        <th>
                            {{ trans('cruds.produit.fields.nom') }}
                        </th>
                        <th>
                            {{ trans('cruds.produit.fields.prix') }}
                        </th>
                        <th>
                            {{ trans('cruds.produit.fields.description') }}
                        </th>
                        <th>
                            {{ trans('cruds.produit.fields.stock') }}
                        </th>
                        <th>
                            &nbsp;
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($produits as $key => $produit)
                        <tr data-entry-id="{{ $produit->id }}">
                            <td>

                            </td>
                            <td>
                                {{ $produit->id ?? '' }}
                            </td>
                            <td>
                                {{ $produit->nom ?? '' }}
                            </td>
                            <td>
                                {{ $produit->prix ?? '' }}
                            </td>
                            <td>
                                {{ $produit->description ?? '' }}
                            </td>
                            <td>
                                {{ $produit->stock ?? '' }}
                            </td>
                            <td>
                                @can('produit_show')
                                    <a class="btn btn-xs btn-primary" href="{{ route('admin.produits.show', $produit->id) }}">
                                        {{ trans('global.view') }}
                                    </a>
                                @endcan

                                @can('produit_edit')
                                    <a class="btn btn-xs btn-info" href="{{ route('admin.produits.edit', $produit->id) }}">
                                        {{ trans('global.edit') }}
                                    </a>
                                @endcan

                                @can('produit_delete')
                                    <form action="{{ route('admin.produits.destroy', $produit->id) }}" method="POST" onsubmit="return confirm('{{ trans('global.areYouSure') }}');" style="display: inline-block;">
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
@can('produit_delete')
  let deleteButtonTrans = '{{ trans('global.datatables.delete') }}'
  let deleteButton = {
    text: deleteButtonTrans,
    url: "{{ route('admin.produits.massDestroy') }}",
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
  let table = $('.datatable-Produit:not(.ajaxTable)').DataTable({ buttons: dtButtons })
  $('a[data-toggle="tab"]').on('shown.bs.tab click', function(e){
      $($.fn.dataTable.tables(true)).DataTable()
          .columns.adjust();
  });
  
})

</script>
@endsection
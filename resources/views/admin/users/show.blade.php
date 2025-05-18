@extends('layouts.admin')
@section('content')

<div class="card">
    <div class="card-header">
        {{ trans('global.show') }} {{ trans('cruds.user.title') }}
    </div>

    <div class="card-body">
        <div class="form-group">
            <div class="form-group">
                <a class="btn btn-default" href="{{ route('admin.users.index') }}">
                    {{ trans('global.back_to_list') }}
                </a>
            </div>
            <table class="table table-bordered table-striped">
                <tbody>
                    <tr>
                        <th>
                            {{ trans('cruds.user.fields.id') }}
                        </th>
                        <td>
                            {{ $user->id }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.user.fields.name') }}
                        </th>
                        <td>
                            {{ $user->name }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.user.fields.email') }}
                        </th>
                        <td>
                            {{ $user->email }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.user.fields.email_verified_at') }}
                        </th>
                        <td>
                            {{ $user->email_verified_at }}
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.user.fields.roles') }}
                        </th>
                        <td>
                            @foreach($user->roles as $key => $roles)
                                <span class="label label-info">{{ $roles->title }}</span>
                            @endforeach
                        </td>
                    </tr>
                    <tr>
                        <th>
                            {{ trans('cruds.user.fields.salaire') }}
                        </th>
                        <td>
                            {{ $user->salaire }}
                        </td>
                    </tr>
                    <tr>
    <th>
    {{ trans('cruds.user.fields.qr_code') }}
</th>
<td>
    @if(Storage::disk('public')->exists("qrcodes/{$user->id}.png"))
        <img src="{{ asset("storage/qrcodes/{$user->id}.png") }}" alt="QR Code de {{ $user->name }}" width="200">
        <p class="mt-2">
            <a href="{{ asset("storage/qrcodes/{$user->id}.png") }}" class="btn btn-sm btn-success" download>
                {{ trans('cruds.user.fields.qr_code_download') }}
            </a>
        </p>
    @else
        <span class="text-danger">
            {{ trans('cruds.user.fields.qr_code_missing') }}
        </span>
    @endif
</td>
</tr>

                </tbody>
            </table>
            <div class="form-group">
                <a class="btn btn-default" href="{{ route('admin.users.index') }}">
                    {{ trans('global.back_to_list') }}
                </a>
            </div>
        </div>
    </div>
</div>



@endsection
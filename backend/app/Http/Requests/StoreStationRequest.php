<?php

namespace App\Http\Requests;

use App\Models\Station;
use Gate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Response;

class StoreStationRequest extends FormRequest
{
    public function authorize()
    {
        return Gate::allows('station_create');
    }

    public function rules()
    {
        return [
            'nom' => [
                'string',
                'required',
                'unique:stations',
            ],
            'ville' => [
                'string',
                'required',
                'unique:stations',
            ],
            
        ];
    }
}
<?php

namespace App\Http\Requests;

use App\Models\Coli;
use Gate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Response;

class StoreColiRequest extends FormRequest
{
    public function authorize()
    {
        return Gate::allows('coli_create');
    }

    public function rules()
    {
        return [
            'destinataire_nom' => [
                'string',
                'required',
            ],
            'destinataire_tel' => [
                'string',
                'required',
            ],
            'heure_envoi' => [
                'required',
                'date_format:' . config('panel.time_format'),
            ],
            'heure_retrait' => [
                'date_format:' . config('panel.time_format'),
                'nullable',
            ],
            'station_depart_id' => [
                'required',
                'integer',
            ],
            'station_arrivee_id' => [
                'required',
                'integer',
            ],
            'user_id' => [
                'required',
                'integer',
            ],
            'expediteur_id' => [
                'required',
                'integer',
            ],
        ];
    }
}
<?php

namespace App\Http\Requests;

use App\Models\Reservation;
use Gate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Response;

class UpdateReservationRequest extends FormRequest
{
    public function authorize()
    {
        return Gate::allows('reservation_edit');
    }

    public function rules()
    {
        return [
            'heure_depart' => [
                'required',
                'date_format:' . config('panel.time_format'),
            ],
            'nombre_tickets' => [
                'string',
                'required',
            ],
            'statut' => [
                'required',
            ],
            'client_id' => [
                'required',
                'integer',
            ],
            'station_depart_id' => [
                'required',
                'integer',
            ],
            'station_arrivee_id' => [
                'required',
                'integer',
            ],
        ];
    }
}
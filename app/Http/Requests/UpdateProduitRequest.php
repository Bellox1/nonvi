<?php

namespace App\Http\Requests;

use App\Models\Produit;
use Gate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Response;

class UpdateProduitRequest extends FormRequest
{
    public function authorize()
    {
        return Gate::allows('produit_edit');
    }

    public function rules()
    {
        return [
            'nom' => [
                'string',
                'required',
            ],
            'prix' => [
                'required',
            ],
            'description' => [
                'string',
                'nullable',
            ],
            'stock' => [
                'required',
                'integer',
                'min:-2147483648',
                'max:2147483647',
            ],
        ];
    }
}
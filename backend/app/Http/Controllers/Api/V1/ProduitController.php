<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    public function index()
    {
        return response()->json(Produit::all());
    }

    public function show($id)
    {
        return response()->json(Produit::findOrFail($id));
    }
}

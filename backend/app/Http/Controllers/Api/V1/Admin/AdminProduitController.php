<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use Illuminate\Http\Request;

class AdminProduitController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('produit_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $produits = Produit::latest()->paginate(20);
        return response()->json($produits);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('produit_create')) {
            return response()->json(['message' => 'Action refusée. Permission de création manquante.'], 403);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'prix' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $data = $request->all();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('produits', 'public');
            $data['image'] = $path;
        }

        $produit = Produit::create($data);

        return response()->json([
            'message' => 'Produit créé avec succès',
            'produit' => $produit
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('produit_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $produit = Produit::findOrFail($id);

        $request->validate([
            'nom' => 'required|string|max:255',
            'prix' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $data = $request->all();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($produit->image) {
                \Storage::disk('public')->delete($produit->image);
            }
            $path = $request->file('image')->store('produits', 'public');
            $data['image'] = $path;
        }

        $produit->update($data);

        return response()->json([
            'message' => 'Produit mis à jour',
            'produit' => $produit
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('produit_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $produit = Produit::findOrFail($id);
        $produit->delete();

        return response()->json(['message' => 'Produit supprimé']);
    }
}

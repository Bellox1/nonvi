<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pub;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminPubController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('pub_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $pubs = Pub::latest()->get();
        return response()->json($pubs);
    }

    public function store(Request $request)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('pub_create')) {
            return response()->json(['message' => 'Action refusée. Permission de création manquante.'], 403);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'active' => 'nullable|boolean',
        ]);

        $data = $request->all();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('pubs', 'public');
            $data['image'] = $path;
        }

        $pub = Pub::create($data);

        return response()->json([
            'message' => 'Publicité créée avec succès',
            'pub' => $pub
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('pub_edit')) {
            return response()->json(['message' => 'Action refusée. Permission de modification manquante.'], 403);
        }

        $pub = Pub::findOrFail($id);

        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'active' => 'nullable|boolean',
        ]);

        $data = $request->all();

        if ($request->hasFile('image')) {
            if ($pub->image) {
                Storage::disk('public')->delete($pub->image);
            }
            $path = $request->file('image')->store('pubs', 'public');
            $data['image'] = $path;
        }

        $pub->update($data);

        return response()->json([
            'message' => 'Publicité mise à jour',
            'pub' => $pub
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Gate::allows('pub_delete')) {
            return response()->json(['message' => 'Action refusée. Permission de suppression manquante.'], 403);
        }

        $pub = Pub::findOrFail($id);
        if ($pub->image) {
            Storage::disk('public')->delete($pub->image);
        }
        $pub->delete();

        return response()->json(['message' => 'Publicité supprimée']);
    }
}

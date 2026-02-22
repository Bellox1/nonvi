<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassDestroyProduitRequest;
use App\Http\Requests\StoreProduitRequest;
use App\Http\Requests\UpdateProduitRequest;
use App\Models\Produit;
use App\Models\AuditLog;
use Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ProduitsController extends Controller
{
    public function index()
    {
        abort_if(Gate::denies('produit_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $produits = Produit::all();

        return view('admin.produits.index', compact('produits'));
    }

    public function create()
    {
        abort_if(Gate::denies('produit_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.produits.create');
    }

    public function store(StoreProduitRequest $request)
    {
        $produit = Produit::create($request->all());

        AuditLog::create([
            'description' => 'create',
            'subject_type'  => Produit::class,
            'subject_id'    => $produit->id,
            'user_id'       => Auth::id(),
            'action'        => 'create',
            'properties'    => json_encode($produit->toArray()),
            'host'          => request()->ip(),
            'created_at'    => now(),
        ]);

        return redirect()->route('admin.produits.index');
    }

    public function edit(Produit $produit)
    {
        abort_if(Gate::denies('produit_edit'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.produits.edit', compact('produit'));
    }

    public function update(UpdateProduitRequest $request, Produit $produit)
    {
        $old = $produit->toArray();
        $produit->update($request->all());

        AuditLog::create([
            'description' => 'update',
            'subject_type'  => Produit::class,
            'subject_id'    => $produit->id,
            'user_id'       => Auth::id(),
            'properties'    => json_encode([
                'before' => $old,
                'after'  => $produit->toArray(),
            ]),
            'host'          => request()->ip(),
            'created_at'    => now(),
        ]);

        return redirect()->route('admin.produits.index');
    }

    public function show(Produit $produit)
    {
        abort_if(Gate::denies('produit_show'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.produits.show', compact('produit'));
    }

    public function destroy(Produit $produit)
    {
        abort_if(Gate::denies('produit_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        $id = $produit->id;
        $deletedData = $produit->toArray();
        $produit->delete();

        AuditLog::create([
            'description' => 'delete',
            'subject_type'  => Produit::class,
            'subject_id'    => $id,
            'user_id'       => Auth::id(),
            'properties'    => json_encode($deletedData),
            'host'          => request()->ip(),
            'created_at'    => now(),
        ]);

        return back();
    }

    public function massDestroy(MassDestroyProduitRequest $request)
    {
        $produits = Produit::find(request('ids'));

        foreach ($produits as $produit) {
            $id = $produit->id;
            $deletedData = $produit->toArray();
            $produit->delete();

            AuditLog::create([
                'description'   => 'mass_delete',
                'subject_type'  => Produit::class,
                'subject_id'    => $id,
                'user_id'       => Auth::id(),
                'properties'    => json_encode($deletedData),
                'host'          => request()->ip(),
                'created_at'    => now(),
            ]);
        }

        return response(null, Response::HTTP_NO_CONTENT);
    }
}

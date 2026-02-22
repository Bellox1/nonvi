<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    private function checkAdmin()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('station_access')) {
            abort(403, 'Accès refusé');
        }
    }

    public function getPrice()
    {
        $setting = Setting::where('key', 'prix_ticket')->first();
        $prix = $setting ? $setting->value : '0';
        return response()->json(['prix' => $prix]);
    }

    public function updatePrice(Request $request)
    {
        $this->checkAdmin();
        $request->validate([
            'prix' => 'required|numeric|min:0'
        ]);

        Setting::updateOrCreate(
            ['key' => 'prix_ticket'],
            ['value' => $request->prix]
        );

        return response()->json(['message' => 'Prix du ticket mis à jour avec succès']);
    }
}

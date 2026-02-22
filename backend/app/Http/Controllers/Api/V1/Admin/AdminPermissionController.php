<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;

class AdminPermissionController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('permission_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $permissions = Permission::all();
        return response()->json($permissions);
    }
}

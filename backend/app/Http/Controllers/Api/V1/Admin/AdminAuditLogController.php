<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('audit_log_access')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $logs = AuditLog::with('user')->latest()->paginate(50);
        return response()->json($logs);
    }

    public function show($id)
    {
        $log = AuditLog::findOrFail($id);
        return response()->json($log);
    }
}

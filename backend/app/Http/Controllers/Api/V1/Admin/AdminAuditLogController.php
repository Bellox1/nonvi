<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

use App\Traits\ExportCsvTrait;

class AdminAuditLogController extends Controller
{
    use ExportCsvTrait;

    public function export()
    {
        if (!\Illuminate\Support\Facades\Gate::allows('export_csv')) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $logs = AuditLog::with('user')->latest()->get();
        
        $data = $logs->map(function($l) {
            return [
                $l->id,
                $l->user->name ?? 'Système',
                $l->description,
                $l->subject_type,
                $l->host,
                $l->created_at->format('d/m/Y H:i')
            ];
        });

        return $this->downloadCsv($data, 'logs-' . date('Y-m-d'), [
            'ID', 'Utilisateur', 'Action', 'Sujet', 'IP', 'Date'
        ]);
    }
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

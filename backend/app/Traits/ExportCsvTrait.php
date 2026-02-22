<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait ExportCsvTrait
{
    public function downloadCsv($data, $filename, $headers)
    {
        $callback = function () use ($data, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);

            foreach ($data as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        $responseHeaders = [
            'Content-type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename=' . $filename . '.csv',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];

        return response()->stream($callback, 200, $responseHeaders);
    }
}

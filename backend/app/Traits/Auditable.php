<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function (Model $model) {
            static::audit('audit:created', $model);
        });

        static::updated(function (Model $model) {
            static::audit('audit:updated', $model, $model->getChanges());
        });

        static::deleted(function (Model $model) {
            static::audit('audit:deleted', $model);
        });

        if (method_exists(static::class, 'restored')) {
            static::restored(function (Model $model) {
                static::audit('audit:restored', $model);
            });
        }
    }

    protected static function audit($description, $model, $changes = [])
    {
        AuditLog::create([
            'description'  => $description,
            'subject_id'   => $model->id ?? null,
            'subject_type' => get_class($model),
            'user_id'      => auth()->id() ?? null,
            'properties'   => !empty($changes) ? $changes : $model->getAttributes(),
            'host'         => request()->ip() ?? null,
        ]);
    }
}
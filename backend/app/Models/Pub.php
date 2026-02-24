<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Pub extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'nom',
        'description',
        'image',
        'active',
    ];
}

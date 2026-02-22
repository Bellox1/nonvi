<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trajet extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_depart_id',
        'station_arrivee_id',
        'prix',
    ];

    public function station_depart()
    {
        return $this->belongsTo(Station::class, 'station_depart_id');
    }

    public function station_arrivee()
    {
        return $this->belongsTo(Station::class, 'station_arrivee_id');
    }
}

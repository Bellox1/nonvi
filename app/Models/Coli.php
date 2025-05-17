<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coli extends Model
{
    use SoftDeletes, HasFactory;

    public $table = 'colis';

    public const STATUT_SELECT = [

    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $fillable = [
        'destinataire_nom',
        'destinataire_tel',
        'prix',
        'heure_envoi',
        'heure_retrait',
        'statut',
        'station_depart_id',
        'station_arrivee_id',
        'user_id',
        'expediteur_id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function station_depart()
    {
        return $this->belongsTo(Station::class, 'station_depart_id');
    }

    public function station_arrivee()
    {
        return $this->belongsTo(Station::class, 'station_arrivee_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function expediteur()
    {
        return $this->belongsTo(Client::class, 'expediteur_id');
    }
}
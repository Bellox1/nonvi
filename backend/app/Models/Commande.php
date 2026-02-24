<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;

class Commande extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'user_id',
        'guest_name',
        'guest_phone',
        'produit_id',
        'quantite',
        'prix_total',
        'type_retrait',
        'ville_livraison',
        'station_id',
        'statut',
        'payment_id',
        'payment_status',
        'payment_method',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(CommandeItem::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class);
    }
}

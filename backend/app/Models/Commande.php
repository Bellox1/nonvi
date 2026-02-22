<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commande extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'produit_id',
        'quantite',
        'prix_total',
        'type_retrait',
        'ville_livraison',
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
}

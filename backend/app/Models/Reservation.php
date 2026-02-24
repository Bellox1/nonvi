<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use Auditable, SoftDeletes, HasFactory;

    public $table = 'reservations';

    public const STATUT_SELECT = [
        'en_attente' => 'En attente',
        'confirmee' => 'Confirmée',
        'annulee' => 'Annulée',
    ];

    public const MOYEN_PAIEMENT_SELECT = [
    'mobile_money' => 'Mobile Money',
    'carte_bancaire' => 'Carte Bancaire',
    'station' => 'Paiement à la station',
];
 public const HEURE_DEPART_SELECT = [
    '06:00:00' => '06:00',
    '06:15:00' => '06:15',
    '06:30:00' => '06:30',
    '06:45:00' => '06:45',
    '07:00:00' => '07:00',
    '07:15:00' => '07:15',
    '07:30:00' => '07:30',
    '07:45:00' => '07:45',
    '08:00:00' => '08:00',
    '08:15:00' => '08:15',
    '08:30:00' => '08:30',
    '08:45:00' => '08:45',
    '09:00:00' => '09:00',
    '09:15:00' => '09:15',
    '09:30:00' => '09:30',
    '09:45:00' => '09:45',
    '10:00:00' => '10:00',
    '10:15:00' => '10:15',
    '10:30:00' => '10:30',
    '10:45:00' => '10:45',
    '11:00:00' => '11:00',
    '11:15:00' => '11:15',
    '11:30:00' => '11:30',
    '11:45:00' => '11:45',
    '12:00:00' => '12:00',
    '12:15:00' => '12:15',
    '12:30:00' => '12:30',
    '12:45:00' => '12:45',
    '13:00:00' => '13:00',
    '13:15:00' => '13:15',
    '13:30:00' => '13:30',
    '13:45:00' => '13:45',
    '14:00:00' => '14:00',
    '14:15:00' => '14:15',
    '14:30:00' => '14:30',
    '14:45:00' => '14:45',
    '15:00:00' => '15:00',
    '15:15:00' => '15:15',
    '15:30:00' => '15:30',
    '15:45:00' => '15:45',
    '16:00:00' => '16:00',
    '16:15:00' => '16:15',
    '16:30:00' => '16:30',
    '16:45:00' => '16:45',
    '17:00:00' => '17:00',
    '17:15:00' => '17:15',
    '17:30:00' => '17:30',
    '17:45:00' => '17:45',
    '18:00:00' => '18:00',
    '18:15:00' => '18:15',
    '18:30:00' => '18:30',
    '18:45:00' => '18:45',
    '19:00:00' => '19:00',
    '19:15:00' => '19:15',
    '19:30:00' => '19:30',
    '19:45:00' => '19:45',
    '20:00:00' => '20:00',
    '20:15:00' => '20:15',
    '20:30:00' => '20:30',
    '20:45:00' => '20:45',
    '21:00:00' => '21:00',
    '21:15:00' => '21:15',
    '21:30:00' => '21:30',
    '21:45:00' => '21:45',
    '22:00:00' => '22:00',
];
    protected $dates = [
        'date_depart',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $fillable = [
        'date_depart',
        'heure_depart',
        'nombre_tickets',
        'moyen_paiement',
        'prix',
        'statut',
        'user_id',
        'guest_name',
        'guest_phone',
        'station_depart_id',
        'station_arrivee_id',
        'qr_code',
        'is_scanned',
        'payment_id',
        'payment_status',
        'payment_method',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
  protected $attributes = [
        'statut' => 'en_attente', // valeur par défaut ici
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function getStatutAttribute($value)
    {
        // On ne touche pas aux réservations annulées ou déjà terminées en dur
        if (in_array($value, ['annule', 'termine'])) {
            return $value;
        }

        try {
            // S'assurer qu'on a un objet Carbon pour la date
            $carbonDate = $this->date_depart instanceof \Carbon\Carbon 
                ? $this->date_depart 
                : \Carbon\Carbon::parse($this->date_depart);
            
            $departure = \Carbon\Carbon::parse($carbonDate->format('Y-m-d') . ' ' . $this->heure_depart);
            
            // Si l'heure de départ + 2h est passée -> Terminé
            if ($departure->copy()->addHours(2)->isPast()) {
                return 'termine';
            }

            // Si l'heure de départ est passée -> En trajet
            if ($departure->isPast() && in_array($value, ['confirme', 'confirmee'])) {
                return 'en_trajet';
            }
        } catch (\Exception $e) {
            return $value;
        }

        return $value;
    }



    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function station_depart()
    {
        return $this->belongsTo(Station::class, 'station_depart_id');
    }

    public function station_arrivee()
    {
        return $this->belongsTo(Station::class, 'station_arrivee_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
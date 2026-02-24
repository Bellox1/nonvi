<?php
// app/Models/User.php

namespace App\Models;

use Carbon\Carbon;
use DateTimeInterface;
use Hash;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\CustomResetPassword;
use Illuminate\Support\Str;
use App\Traits\Auditable;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes, Notifiable, HasFactory, Auditable;

    public $table = 'users';

    protected $hidden = [
        'remember_token',
        'password',
    ];

    protected $appends = [
        'points',
    ];

    protected $dates = [
        'email_verified_at',
        'created_at',
        'updated_at',
        'deleted_at',
        'qr_status_updated_at', // ajout ici
    ];

    protected $fillable = [
        'unique_id',
        'name',
        'email',
        'tel',
        'verification_code',
        'phone_verified_at',
        'email_verified_at',
        'password',
        'remember_token',
        'login_token',
        'qr_status',
        'qr_status_updated_at',
        'salaire',
        'station_id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'qr_status_updated_at' => 'datetime',
        'phone_verified_at' => 'datetime',
    ];

    protected static function booted()
    {
        parent::booted();

        static::creating(function ($user) {
            if (!$user->unique_id) {
                do {
                    $uniqueId = rand(10000000, 99999999);
                } while (static::where('unique_id', $uniqueId)->exists());
                $user->unique_id = $uniqueId;
            }
        });
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function getIsAdminAttribute()
    {
        return $this->roles()->where('id', 1)->exists();
    }

    public function getEmailVerifiedAtAttribute($value)
    {
        return $value ? Carbon::createFromFormat('Y-m-d H:i:s', $value)->format(config('panel.date_format') . ' ' . config('panel.time_format')) : null;
    }

    public function setEmailVerifiedAtAttribute($value)
    {
        $this->attributes['email_verified_at'] = $value
            ? Carbon::createFromFormat(config('panel.date_format') . ' ' . config('panel.time_format'), $value)->format('Y-m-d H:i:s')
            : null;
    }

    public function setPasswordAttribute($input)
    {
        if ($input) {
            $this->attributes['password'] = app('hash')->needsRehash($input) ? Hash::make($input) : $input;
        }
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class, 'station_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'user_id');
    }

    public function getPointsAttribute()
    {
        return $this->reservations()->where('statut', '!=', 'annulee')->sum('nombre_tickets');
    }
}

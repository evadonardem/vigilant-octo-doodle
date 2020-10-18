<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\Models\AttendanceLog;
use App\Models\Delivery;
use App\Models\PayPeriodDeduction;
use App\Models\Role;
use App\Models\Rate;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'biometric_id', 'type', 'name', 'password'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
    ];

    public function rates()
    {
        return $this->hasMany(Rate::class, 'user_id', 'id');
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'user_id', 'id');
    }

    public function roles()
    {
        return $this->belongsToMany(
          Role::class,
          'user_roles',
          'user_id',
          'role_id'
        )->withTimestamps();
    }

    public function attendanceLogs()
    {
        return $this->hasMany(AttendanceLog::class, 'biometric_id', 'biometric_id');
    }

    public function payPeriodDeductions()
    {
        return $this->hasMany(PayPeriodDeduction::class, 'user_id', 'id');
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}

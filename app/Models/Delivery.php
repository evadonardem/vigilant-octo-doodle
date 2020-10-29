<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\User;

class Delivery extends Model
{
    protected $fillable = ['user_id', 'delivery_date', 'no_of_deliveries', 'remarks'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}

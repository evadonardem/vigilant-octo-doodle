<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    protected $fillable = ['user_id', 'delivery_date', 'no_of_deliveries', 'remarks'];
}

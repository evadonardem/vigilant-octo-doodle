<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rate extends Model
{
    protected $fillable = ['user_id', 'effectivity_date', 'rate_type_id', 'amount'];

    public function type()
    {
        return $this->belongsTo(RateType::class, 'rate_type_id', 'id');
    }
}

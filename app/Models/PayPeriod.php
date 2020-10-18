<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayPeriod extends Model
{
    protected $fillable = ['from', 'to'];

    public function commonDeductions()
    {
        return $this->hasMany(PayPeriodCommonDeduction::class, 'pay_period_id', 'id');
    }
}

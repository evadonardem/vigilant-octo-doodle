<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayPeriod extends Model
{
    protected $fillable = ['from', 'to', 'include_deliveries_from_purchase_orders'];

    public function commonDeductions()
    {
        return $this->hasMany(PayPeriodCommonDeduction::class, 'pay_period_id', 'id');
    }
}

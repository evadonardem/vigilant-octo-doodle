<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayPeriodDeduction extends Model
{
    protected $fillable = ['pay_period_id', 'deduction_type_id', 'amount'];

    public function deductionType()
    {
        return $this->belongsTo(DeductionType::class, 'deduction_type_id', 'id');
    }
}

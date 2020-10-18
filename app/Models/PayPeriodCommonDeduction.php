<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayPeriodCommonDeduction extends Model
{
    protected $fillable = ['deduction_type_id', 'default_amount'];
}

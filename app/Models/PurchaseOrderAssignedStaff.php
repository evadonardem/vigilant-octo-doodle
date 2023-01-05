<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderAssignedStaff extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'include_deliveries_for_pay_periods',
    ];
}

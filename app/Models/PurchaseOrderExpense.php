<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'amount_original',
        'amount_actual',
    ];
}

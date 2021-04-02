<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderStoreItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'quantity_original',
        'quantity_actual',
        'quantity_bad_orders',
        'quantity_returns',
    ];
}

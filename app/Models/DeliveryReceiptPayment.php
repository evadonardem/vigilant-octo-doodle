<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryReceiptPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_date',
        'purchase_order_store_item_id',
        'amount',
        'remarks',
    ];
}

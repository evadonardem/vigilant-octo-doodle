<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryReceiptPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'delivery_receipt_no',
        'payment_date',
        'amount',
        'remarks',
    ];
}

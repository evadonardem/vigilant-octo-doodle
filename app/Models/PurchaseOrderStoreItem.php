<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrderStoreItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'quantity_original',
        'quantity_actual',
        'quantity_bad_orders',
        'quantity_returns',
        'delivery_receipt_no',
        'booklet_no',
        'remarks',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    public function payments(): HasMany
    {
        return $this
            ->hasMany(DeliveryReceiptPayment::class, 'purchase_order_store_item_id')
            ->orderBy('payment_date', 'desc');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesInvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sales_invoice_id',
        'store_id',
        'item_id',
        'quantity',
        'price',
        'total_amount',
    ];

    protected $appends = [
        'price',
        'total_amount',
    ];

    public function salesInvoice()
    {
        return $this->belongsTo(SalesInvoice::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function getPriceAttribute()
    {
        $itemId = $this->item->id;
        $item = $this->store ? $this->store->items()
            ->where('item_id', $itemId)
            ->where('effectivity_date', '<=', $this->salesInvoice->from)
            ->first() : null;

        return $item ? $item->pivot->amount : 0.00;
    }

    public function getTotalAmountAttribute()
    {
        return number_format($this->attributes['quantity'] * $this->price, 2, ".", "");
    }
}

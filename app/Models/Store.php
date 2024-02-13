<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category_id',
        'location_id',
        'address_line',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function promodisers(): HasMany
    {
        return $this->hasMany(Promodiser::class);
    }

    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'store_item_prices')
            ->withPivot('effectivity_date', 'amount')
            ->orderBy('store_item_prices.effectivity_date', 'desc')
            ->withTimestamps();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderStoreItem::class);
    }

    public function deliveryReceiptPayments(): HasMany
    {
        return $this->hasMany(DeliveryReceiptPayment::class);
    }
}

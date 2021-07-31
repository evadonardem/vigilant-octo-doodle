<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category_id',
        'location_id',
        'address_line',
    ];

    public function promodisers()
    {
        return $this->hasMany(Promodiser::class);
    }

    public function items()
    {
        return $this->belongsToMany(Item::class, 'store_item_prices')
            ->withPivot('effectivity_date', 'amount')
            ->withTimestamps();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}

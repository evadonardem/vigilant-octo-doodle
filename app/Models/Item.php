<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
    ];

    public function stores() {
        return $this->belongsToMany(Store::class, 'store_item_prices');
    }
}

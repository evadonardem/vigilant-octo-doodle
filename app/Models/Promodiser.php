<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promodiser extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'contact_no',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function jobContracts()
    {
        return $this->hasMany(JobContract::class);
    }

    public function ratings()
    {
        return $this->belongsToMany(Rating::class, PromodiserRating::class)
            ->withTimestamps()
            ->orderByPivot('created_at', 'desc');
    }

    public function payments()
    {
        return $this->hasMany(PromodiserPayment::class);
    }
}

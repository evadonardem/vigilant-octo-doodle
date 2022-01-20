<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobContract extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'promodiser_id',
        'start_date',
        'end_date',
        'rate',
        'remarks',
    ];
    
    public function promodiser()
    {
        return $this->belongsTo(Promodiser::class);
    }
}

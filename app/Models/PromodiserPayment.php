<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromodiserPayment extends Model
{
    use HasFactory;

    protected $fillable = ['promodiser_id', 'from', 'to'];
}

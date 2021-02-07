<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OvertimeRate extends Model
{

    protected $fillable = [
        'effectivity_date',
        'overtime_rate_type_id',
        'non_night_shift',
        'night_shift',
    ];

    public function type()
    {
        return $this->belongsTo(OvertimeRateType::class, 'overtime_rate_type_id', 'id');
    }
}

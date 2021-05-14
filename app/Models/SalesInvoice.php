<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
         'booklet_no',
         'invoice_no',
         'store_id',
         'date_countered',
         'from',
         'to',
         'total_sales',
         'vat_rate',
    ];

    protected $appends = [
        'vat_amount',
        'total_sales_less_vat',
        'total_amount_due',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function getVatAmountAttribute()
    {
        return round($this->total_sales * $this->vat_rate, 2);
    }

    public function getTotalSalesLessVatAttribute()
    {
        return $this->total_sales - $this->vat_amount;
    }

    public function getTotalAmountDueAttribute()
    {
        return $this->total_sales_less_vat + $this->vat_amount;
    }
}

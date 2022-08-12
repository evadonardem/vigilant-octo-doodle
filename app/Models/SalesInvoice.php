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
         'category_id',
         'date_countered',
         'from',
         'to',
         'total_sales',
         'vat_rate',
    ];

    protected $totalSales = 0;
    protected $appends = [
        'total_sales',
        'vat_amount',
        'total_sales_less_vat',
        'total_amount_due',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function items()
    {
        return $this->hasMany(SalesInvoiceItem::class);
    }

    public function getTotalSalesAttribute()
    {
        return $this->totalSales;
    }

    public function setTotalSalesAttribute($totalSales)
    {
        $this->totalSales = $totalSales;
    }

    public function getVatAmountAttribute()
    {
        return $this->total_sales * $this->vat_rate;
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

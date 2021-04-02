<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'location',
        'from',
        'to',
        'purchase_order_status_id',
    ];

    protected $appends = ['days'];

    public function getDaysAttribute() {
        $from = Carbon::createFromFormat('Y-m-d', $this->from);
        $to = Carbon::createFromFormat('Y-m-d', $this->to);
        return $from->diffInDays($to);
    }

    public function status() {
        return $this
            ->belongsTo(PurchaseOrderStatus::class, 'purchase_order_status_id');
    }

    public function stores() {
        return $this
            ->belongsToMany(Store::class, 'purchase_order_store_items')
            ->distinct();
    }

    public function items() {
        return $this
            ->belongsToMany(Item::class, 'purchase_order_store_items')
            ->withPivot([
                'id',
                'store_id',
                'quantity_original',
                'quantity_actual',
                'quantity_bad_orders',
                'quantity_returns',
            ])
            ->distinct();
    }
}

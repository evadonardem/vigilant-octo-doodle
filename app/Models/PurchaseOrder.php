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

    protected $appends = ['trips'];

    public function getTripsAttribute()
    {
        $from = Carbon::createFromFormat('Y-m-d', $this->from);
        $to = Carbon::createFromFormat('Y-m-d', $this->to);
        return $from->diffInDays($to) + 1;
    }

    public function status()
    {
        return $this
            ->belongsTo(PurchaseOrderStatus::class, 'purchase_order_status_id');
    }

    public function stores()
    {
        return $this
            ->belongsToMany(Store::class, 'purchase_order_store_items')
            ->withPivot(['id']);
    }

    public function storesSortOrder()
    {
        return $this
            ->belongsToMany(Store::class, 'purchase_order_stores_sort_orders')
            ->withPivot(['id', 'store_id', 'sort_order'])
            ->withTimeStamps();
    }

    public function items()
    {
        return $this
            ->belongsToMany(Item::class, 'purchase_order_store_items')
            ->withPivot([
                'id',
                'store_id',
                'quantity_original',
                'quantity_actual',
                'quantity_bad_orders',
                'quantity_returns',
                'delivery_receipt_no',
                'booklet_no',
                'remarks',
            ])
            ->distinct();
    }

    public function assignedStaff()
    {
        return $this
            ->belongsToMany(User::class, 'purchase_order_assigned_staff')
            ->withPivot([
                'id',
                'include_deliveries_for_pay_periods',
            ])
            ->distinct();
    }

    public function expenses()
    {
        return $this->hasMany(PurchaseOrderExpense::class, 'purchase_order_id', 'id');
    }
}

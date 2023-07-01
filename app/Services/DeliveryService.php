<?php

namespace App\Services;

use App\Models\PurchaseOrder;

class DeliveryService
{
    public function getAllTripsByPeriod(string $from, string $to)
    {
        $purchaseOrders = PurchaseOrder::with('assignedStaff')
            ->where('purchase_order_status_id', 3)
            ->where(function ($query) use ($from, $to) {
                $query
                    ->where(function ($query) use ($from, $to) {
                        $query
                            ->where('from', '>=', $from)
                            ->where('from', '<=', $to);
                    })
                    ->orWhere(function ($query) use ($from, $to) {
                        $query
                            ->where('to', '>=', $from)
                            ->where('to', '<=', $to);
                    });
            })
            ->whereHas('assignedStaff', function ($query) {
				$query->where('include_deliveries_for_pay_periods', '=', 1);
			})
			->with(['assignedStaff' => function ($query) {
				$query->where('include_deliveries_for_pay_periods', '=', 1);
			}])
            ->get()
            ->map(function ($purchaseOrder) use ($from, $to) {
                $purchaseOrder->from = $purchaseOrder->from < $from ? $from : $purchaseOrder->from;
                $purchaseOrder->to = $purchaseOrder->to > $to ? $to : $purchaseOrder->to;
                return (object) [
                    'coverage_date' => $purchaseOrder->to,
                    'purchase_order_code' => $purchaseOrder->code,
                    'no_of_deliveries' => $purchaseOrder->trips,
                    'assigned_staff' => $purchaseOrder->assignedStaff,
                ];
            });

        $allAssignedStaff = $purchaseOrders->map(function ($purchaseOrder) {
            return $purchaseOrder->assigned_staff;
        })->flatten(1)->unique()->keyBy('biometric_id');

        $allAssignedStaff->each(function ($staff) use ($purchaseOrders) {
            $filteredPurchaseOrders = $purchaseOrders->filter(function ($purchaseOrder) use ($staff) {
                return $purchaseOrder->assigned_staff->where('biometric_id', $staff->biometric_id)->isNotEmpty();
            })->map(function ($purchaseOrder) {
                return (object) [
                    'coverage_date' => $purchaseOrder->coverage_date,
                    'purchase_order_code' => $purchaseOrder->purchase_order_code,
                    'no_of_deliveries' => $purchaseOrder->no_of_deliveries,
                ];
            });

            $ratesQuery = $staff->rates();
            $staff->deliveries = $filteredPurchaseOrders->groupBy('coverage_date')->map(function ($purchaseOrders) use ($ratesQuery) {
                $coverageDate = $purchaseOrders->first()->coverage_date;
                $perDeliveryRateAmount = $ratesQuery
                    ->whereHas('type', function ($query) {
                        $query->where('code', 'per_delivery');
                    })
                    ->where(
                        'effectivity_date',
                        '<=',
                        $coverageDate
                    )
                    ->orderBy('effectivity_date', 'desc')
                    ->first();
                if (!$perDeliveryRateAmount) {
                    $perDeliveryRateAmount = $ratesQuery
                        ->whereHas('type', function ($query) {
                            $query->where('code', 'per_delivery');
                        })
                        ->orderBy('effectivity_date', 'desc')
                        ->first();
                }
                return (object) [
                    'coverage_date' => $coverageDate,
                    'no_of_deliveries' => $purchaseOrders->sum('no_of_deliveries'),
                    'references' => $purchaseOrders->pluck('purchase_order_code')->unique()->implode(','),
                    'effective_per_delivery_rate' => $perDeliveryRateAmount->amount ?? 0,
                ];
            })->toArray();
        });

        return $allAssignedStaff->toArray();
    }
}

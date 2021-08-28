<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GetChartDataRequest;
use App\Models\Store;
use App\Models\PurchaseOrder;
use App\Models\SalesInvoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class ChartDataController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function salesByStore(GetChartDataRequest $request)
    {
        $attributes = $request->only(['from', 'to', 'stores']);
        $attributes['from'] = Carbon::parse($attributes['from'])->startOfMonth();
        $attributes['to'] = Carbon::parse($attributes['to'])->endOfMonth();

        $salesInvoices = SalesInvoice::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->whereBetween('from', [$attributes['from'], $attributes['to']]);
        
        $storeIds = null;
        if ($attributes['stores'] ?? false) {
            $storeIds =  explode(',', $attributes['stores']);
            $salesInvoices = $salesInvoices
                ->whereHas('items', function ($query) use ($storeIds) {
                    $query->whereIn('store_id', $storeIds);
                })
                ->with('items');
        }

        $salesInvoices = $salesInvoices->get();

        $qualifiedStores = [];
        $data = [];
        while($attributes['from'] <= $attributes['to']) {
            $currentMonth = $attributes['from'];

            $currentSalesInvoices = $salesInvoices->whereBetween(
                'from',
                [
                    $currentMonth->startOfMonth()->format('Y-m-d'),
                    $currentMonth->endOfMonth()->format('Y-m-d')
                ]
            );
            
            $indexMonthYear = $currentMonth->format('M Y');
            $data[$indexMonthYear] = [];
            foreach ($currentSalesInvoices as $salesInvoice) {
                $salesInvoiceItems = $salesInvoice->items;
                if ($storeIds) {
                    $salesInvoiceItems = $salesInvoiceItems->whereIn('store_id', $storeIds);
                }
                foreach ($salesInvoiceItems as $salesInvoiceItem) {
                    $store = $salesInvoiceItem->store;
                    if ($store) {
                        $indexStoreId = $store->id;
                        if (array_key_exists($indexStoreId, $data[$indexMonthYear])) {
                            $data[$indexMonthYear][$indexStoreId]['total_sales'] += $salesInvoiceItem->total_amount;
                        } else {
                            if (!array_key_exists($indexStoreId, $qualifiedStores)) {
                                $qualifiedStores[$indexStoreId] = $store->only(['code', 'name']);
                            }
                            $data[$indexMonthYear][$indexStoreId] = [
                                'store' => $store->only(['code', 'name']),
                                'total_sales' => $salesInvoiceItem->total_amount
                            ];
                        }
                    }                        
                }
            }

            $attributes['from'] = $currentMonth->addMonthsNoOverflow();
        }

        if (empty($qualifiedStores)) {
            return response()->json(['data' => null]);
        }

        $chartData = [];
        $chartData['labels'] = array_keys($data);
        $chartData['datasets'] = [];

        foreach ($qualifiedStores as $id => $store) {
            $temp = [
                'label' => $store['code'] . ' ' . $store['name'],
                'data' => [],
                'fill' => false,
                'backgroundColor' => "rgb(" .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) .
                ")",
                'borderColor' => "rgba(" .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", 0.2)",
            ];
            foreach ($chartData['labels'] as $month) {
                $temp['data'][] = array_key_exists($id, $data[$month])
                    ? $data[$month][$id]['total_sales']
                    : 0;
            }

            $chartData['datasets'][] = $temp;
        }
 
        return response()->json(['data' => $chartData]);
    }

    /**
     * Display a listing of the resource.
     * 
     *
     * @return \Illuminate\Http\Response
     */
    public function salesByCategory(GetChartDataRequest $request)
    {
        $attributes = $request->only(['from', 'to', 'categories']);
        $attributes['from'] = Carbon::parse($attributes['from'])->startOfMonth();
        $attributes['to'] = Carbon::parse($attributes['to'])->endOfMonth();

        $salesInvoices = SalesInvoice::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->whereBetween('from', [$attributes['from'], $attributes['to']]);
        
        $categoryIds = null;
        if ($attributes['categories'] ?? false) {
            $categoryIds =  explode(',', $attributes['categories']);
            $salesInvoices = $salesInvoices->whereIn('category_id', $categoryIds);
        }

        $salesInvoices = $salesInvoices->get();

        $qualifiedStoresByCategory = [];
        $data = [];
        while($attributes['from'] <= $attributes['to']) {
            $currentMonth = $attributes['from'];

            $currentSalesInvoices = $salesInvoices->whereBetween(
                'from',
                [
                    $currentMonth->startOfMonth()->format('Y-m-d'),
                    $currentMonth->endOfMonth()->format('Y-m-d')
                ]
            );

            $indexMonthYear = $currentMonth->format('M Y');
            
            $data[$indexMonthYear] = [];
            foreach ($currentSalesInvoices as $salesInvoice) {
                $salesInvoiceItems = $salesInvoice->items;                
                foreach ($salesInvoiceItems as $salesInvoiceItem) {
                    $store = $salesInvoiceItem->store;
                    if ($store) {
                        $indexStoreId = $store->id;
                        if (array_key_exists($indexStoreId, $data[$indexMonthYear])) {
                            $data[$indexMonthYear][$indexStoreId]['total_sales'] += $salesInvoiceItem->total_amount;
                        } else {
                            if (!array_key_exists($indexStoreId, $qualifiedStoresByCategory)) {
                                $qualifiedStoresByCategory[$indexStoreId] = $store->only(['code', 'name']);
                            }
                            $data[$indexMonthYear][$indexStoreId] = [
                                'store' => $store->only(['code', 'name']),
                                'total_sales' => $salesInvoiceItem->total_amount
                            ];
                        }
                    }                    
                }
            }

            $attributes['from'] = $currentMonth->addMonthsNoOverflow();
        }

        if (empty($qualifiedStoresByCategory)) {
            return response()->json(['data' => null]);
        }

        $chartData = [];
        $chartData['labels'] = array_keys($data);
        $chartData['datasets'] = [];

        foreach ($qualifiedStoresByCategory as $id => $store) {
            $temp = [
                'label' => $store['code'] . ' ' . $store['name'],
                'data' => [],
                'fill' => false,
                'backgroundColor' => "rgb(" .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) .
                ")",
                'borderColor' => "rgba(" .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", 0.2)",
            ];
            foreach ($chartData['labels'] as $month) {
                $temp['data'][] = array_key_exists($id, $data[$month])
                    ? $data[$month][$id]['total_sales']
                    : 0;
            }

            $chartData['datasets'][] = $temp;
        }
 
        return response()->json(['data' => $chartData]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function salesByLocation(GetChartDataRequest $request)
    {
        $attributes = $request->only(['from', 'to', 'locations']);
        $attributes['from'] = Carbon::parse($attributes['from'])->startOfMonth();
        $attributes['to'] = Carbon::parse($attributes['to'])->endOfMonth();

        $salesInvoices = SalesInvoice::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->whereBetween('from', [$attributes['from'], $attributes['to']]);
        
        $locationIds = null;
        if ($attributes['locations'] ?? false) {
            $locationIds =  explode(',', $attributes['locations']);
            $salesInvoices = $salesInvoices->whereHas('items.store', function ($query) use ($locationIds) {
                $query->where('location_id', $locationIds);
            });
        }

        $salesInvoices = $salesInvoices->get();

        $qualifiedStoresByLocation = [];
        $data = [];
        while($attributes['from'] <= $attributes['to']) {
            $currentMonth = $attributes['from'];

            $currentSalesInvoices = $salesInvoices->whereBetween(
                'from',
                [
                    $currentMonth->startOfMonth()->format('Y-m-d'),
                    $currentMonth->endOfMonth()->format('Y-m-d')
                ]
            );
            
            $indexMonthYear = $currentMonth->format('M Y');

            $data[$indexMonthYear] = [];
            foreach ($currentSalesInvoices as $salesInvoice) {
                $salesInvoiceItems = $salesInvoice->items;                
                foreach ($salesInvoiceItems as $salesInvoiceItem) {
                    $store = $salesInvoiceItem->store;
                    if (
                        $store &&
                        ($store->location->id ?? false) &&
                        in_array($store->location->id, $locationIds)
                    ) {
                        $indexStoreId = $store->id;
                        if (array_key_exists($indexStoreId, $data[$indexMonthYear])) {
                            $data[$indexMonthYear][$indexStoreId]['total_sales'] += $salesInvoiceItem->total_amount;
                        } else {                        
                            if (!array_key_exists($indexStoreId, $qualifiedStoresByLocation)) {
                                $qualifiedStoresByLocation[$indexStoreId] = $store->only(['code', 'name']);
                            }
                            $data[$indexMonthYear][$indexStoreId] = [
                                'store' => $store->only(['code', 'name']),
                                'total_sales' => $salesInvoiceItem->total_amount
                            ];
                        }
                    }
                }
            }

            $attributes['from'] = $currentMonth->addMonthsNoOverflow();
        }

        if (empty($qualifiedStoresByLocation)) {
            return response()->json(['data' => null]);
        }

        $chartData = [];
        $chartData['labels'] = array_keys($data);
        $chartData['datasets'] = [];

        foreach ($qualifiedStoresByLocation as $id => $store) {
            $temp = [
                'label' => $store['code'] . ' ' . $store['name'],
                'data' => [],
                'fill' => false,
                'backgroundColor' => "rgb(" .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) .
                ")",
                'borderColor' => "rgba(" .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", 0.2)",
            ];
            foreach ($chartData['labels'] as $month) {
                $temp['data'][] = array_key_exists($id, $data[$month])
                    ? $data[$month][$id]['total_sales']
                    : 0;
            }

            $chartData['datasets'][] = $temp;
        }
 
        return response()->json(['data' => $chartData]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function purchaseOrders(GetChartDataRequest $request, string $type)
    {
        $attributes = $request->only(['from', 'to', 'stores', 'categories', 'locations']);
        $attributes['from'] = Carbon::parse($attributes['from'])->startOfMonth();
        $attributes['to'] = Carbon::parse($attributes['to'])->endOfMonth();

        $purchaseOrders = PurchaseOrder::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->whereBetween('from', [$attributes['from'], $attributes['to']]);
        
        $storeIds = null;
        if ($attributes['stores'] ?? false) {
            $storeIds =  explode(',', $attributes['stores']);
            $purchaseOrders = $purchaseOrders
                ->whereHas('stores', function ($query) use ($storeIds) {
                    $query->whereIn('store_id', $storeIds);
                });
        }

        $categoryIds = null;
        if ($attributes['categories'] ?? false) {
            $categoryIds =  explode(',', $attributes['categories']);
            $purchaseOrders = $purchaseOrders
                ->whereHas('stores.category', function ($query) use ($categoryIds) {
                    $query->whereIn('id', $categoryIds);
                });
        }
        
        $locationIds = null;
        if ($attributes['locations'] ?? false) {
            $locationIds =  explode(',', $attributes['locations']);
            $purchaseOrders = $purchaseOrders
                ->whereHas('stores.location', function ($query) use ($locationIds) {
                    $query->whereIn('id', $locationIds);
                });
        }

        $purchaseOrders = $purchaseOrders->get();

        $valueReference = 'quantity_';
        if ($type == 'deliveries') {
            $valueReference .= 'actual';
        } else {
            if ($type == 'returns') {
                $valueReference .= 'returns';
            }
        }
        
        $qualifiedStoreItems = [];
        $data = [];
        while($attributes['from'] <= $attributes['to']) {
            $currentMonth = $attributes['from'];
            $currentPurchaseOrders = $purchaseOrders->whereBetween(
                'from',
                [
                    $currentMonth->startOfMonth()->format('Y-m-d'),
                    $currentMonth->endOfMonth()->format('Y-m-d')
                ]
            );
            $indexMonthYear = $currentMonth->format('M Y');
            $data[$indexMonthYear] = [];
            foreach ($currentPurchaseOrders as $purchaseOrder) {
                $purchaseOrderItems = $purchaseOrder->items;
                if ($storeIds) {
                    $purchaseOrderItems = $purchaseOrderItems->filter(function ($item) use ($storeIds) {
                        return in_array($item->pivot->store_id, $storeIds);
                    });
                }
                if ($categoryIds) {
                    $purchaseOrderItems = $purchaseOrderItems->filter(function ($item) use ($categoryIds) {
                        $store = Store::find($item->pivot->store_id);
                        $category = $store ? $store->category : null;
                        return $category && in_array($category->id, $categoryIds);
                    });
                }
                if ($locationIds) {
                    $purchaseOrderItems = $purchaseOrderItems->filter(function ($item) use ($locationIds) {
                        $store = Store::find($item->pivot->store_id);
                        $location = $store ? $store->location : null;
                        return $location && in_array($location->id, $locationIds);
                    });
                }
                foreach ($purchaseOrderItems as $purchaseOrderItem) {                    
                    $storeId = $purchaseOrderItem->pivot->store_id;
                    $itemId = $purchaseOrderItem->id;
                    $indexItemStoreId = $itemId . '-' . $storeId;
                    $store = Store::find($storeId);
                    if (array_key_exists($indexItemStoreId, $data[$indexMonthYear])) {
                        $data[$indexMonthYear][$indexItemStoreId][$valueReference] += $purchaseOrderItem->pivot->{$valueReference};
                    } else {
                        if (!array_key_exists($indexItemStoreId, $qualifiedStoreItems)) {
                            $qualifiedStoreItems[$indexItemStoreId] = [                                
                                'item' => $purchaseOrderItem->only(['code', 'name']),
                                'store' => $store->only(['code', 'name']),
                            ];
                        }
                        $data[$indexMonthYear][$indexItemStoreId] = [                            
                            'item' => $purchaseOrderItem->only(['code', 'name']),
                            'store' => $store->only(['code', 'name']),
                            $valueReference => $purchaseOrderItem->pivot->{$valueReference},
                        ];
                    }
                }
            }

            $attributes['from'] = $currentMonth->addMonthsNoOverflow();
        }

        if (empty($qualifiedStoreItems)) {
            return response()->json(['data' => null]);
        }

        $chartData = [];
        $chartData['labels'] = array_keys($data);
        $chartData['datasets'] = [];

        foreach ($qualifiedStoreItems as $id => $val) {
            $temp = [
                'label' => '[' . $val['item']['code'] . '] ' . $val['item']['name'] . ' (' .                    
                    $val['store']['code'] . ' ' . $val['store']['name'] . ')',
                'data' => [],
                'fill' => false,
                'backgroundColor' => "rgb(" .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) .
                ")",
                'borderColor' => "rgba(" .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", " .
                    random_int(0, 255) . ", 0.2)",
            ];
            foreach ($chartData['labels'] as $month) {
                $temp['data'][] = array_key_exists($id, $data[$month])
                    ? $data[$month][$id][$valueReference]
                    : 0;
            }

            $chartData['datasets'][] = $temp;
        }
 
        return response()->json(['data' => $chartData]);
    }
}

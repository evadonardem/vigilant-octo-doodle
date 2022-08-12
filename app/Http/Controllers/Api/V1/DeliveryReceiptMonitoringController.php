<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use App\Models\PurchaseOrder;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use stdClass;

class DeliveryReceiptMonitoringController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
		$filterBy = $request->has('by') ? $request->input('by') : 'store';
		$isGenerateCsvReport = $request->has('generate') && $request->input('generate') === 'csv';
		$reportType = $request->has('report_type') ? $request->input('report_type') : null;
		$filenameSegment = '';
		
        $purchaseOrdersQuery = PurchaseOrder::where('purchase_order_status_id', '=', 3)
            ->where('to', '>=', $request->input('from'))
            ->where('to', '<=', $request->input('to'));
        
        $storeId = null;
        $searchStore = null;
        
        $categoryId = null;
        $searchCategory = null;
        
        $locationId = null;
        $searchLocation = null;
            
        if ($filterBy === 'store') {
			if ($request->input('store_id')) {
				$storeId = $request->input('store_id');
				$searchStore = Store::findOrFail($storeId);
				$purchaseOrdersQuery
					->whereHas('items', function ($query) use ($storeId) {
						$query->where('purchase_order_store_items.store_id', '=', $storeId);
					})
					->with(['stores' => function ($query) use ($storeId) {
						$query->where('store_id', '=', $storeId);
					}]);
				$filenameSegment = "{$searchStore->code} {$searchStore->name}";
			} else {
				$purchaseOrdersQuery
					->whereHas('stores')
					->with('stores');
				$filenameSegment = 'All Stores';
			}
		} elseif ($filterBy === 'category') {
			if ($request->input('category_id')) {
				$categoryId = $request->input('category_id');
				$searchCategory = Category::findOrFail($categoryId);
				$purchaseOrdersQuery
					->whereHas('stores.category', function ($query) use ($categoryId) {
						$query->where('id', '=', $categoryId);
					})
					->with(['stores' => function ($query) use ($categoryId) {
						$query->where('category_id', '=', $categoryId);
					}]);
				$filenameSegment = $searchCategory->name;
			} else {
				$purchaseOrdersQuery
					->whereHas('stores.category')
					->with(['stores' => function ($query) {
						$query->whereNotNull('category_id');
					}]);
				$filenameSegment = 'All Categories';
			}
		} else {
			if ($filterBy === 'location') {
				if ($request->input('location_id')) {
					$locationId = $request->input('location_id');
					$searchLocation = Location::findOrFail($locationId);	
					$purchaseOrdersQuery
						->whereHas('stores.location', function ($query) use ($locationId) {
							$query->where('id', '=', $locationId);
						})
						->with(['stores' => function ($query) use ($locationId) {
							$query->where('location_id', '=', $locationId);
						}]);
					$filenameSegment = $searchLocation->name;
				} else {
					$purchaseOrdersQuery
						->whereHas('stores.location')
						->with(['stores' => function ($query) {
							$query->whereNotNull('location_id');
						}]);
					$filenameSegment = 'All Locations';
				}
			}
		}

        $purchaseOrders = $purchaseOrdersQuery->get();
            
        $allStores = $purchaseOrders->map(function ($purchaseOrder) {
			return $purchaseOrder->stores;
		})->flatten(1)->values();
		$storeIds = $allStores->pluck('id')->unique()->toArray();

        $booklets = collect();
        $summary = collect();
        $purchaseOrders->each(function ($purchaseOrder) use ($booklets, $storeIds, $summary) {
            $items = !empty($storeIds)
                ? $purchaseOrder->items()->whereIn('purchase_order_store_items.store_id', $storeIds)->get()
                : $purchaseOrder->items;
            $items->each(function ($item) use ($booklets, $purchaseOrder, $summary) {
                $booklet = $booklets->where('id', '=', $item->pivot->booklet_no)->first();
                if ($booklet) {
                    $deliveryReceipt = $booklet->deliveryReceipts->where('id', '=', $item->pivot->delivery_receipt_no)->first();
                    if ($deliveryReceipt) {
                        $store = $deliveryReceipt->stores->where('id', '=', $item->pivot->store_id)->first();
                        if ($store) {
                            $item->quantity_original = $item->pivot->quantity_original;
                            $item->quantity_actual = $item->pivot->quantity_actual;
                            $item->quantity_bad_orders = $item->pivot->quantity_bad_orders;
                            $item->quantity_returns = $item->pivot->quantity_returns;
                            $store->items->push(
                                (object)$item->only([
                                    'id',
                                    'code',
                                    'name',
                                    'quantity_original',
                                    'quantity_actual',
                                    'quantity_bad_orders',
                                    'quantity_returns',
                                ])
                            );
                            $this->populateSummary($summary, $item);
                        }
                    } else {
                        $newDeliveryReceipt = $this->createNewDeliveryReceipt($purchaseOrder, $item);
                        $newDeliveryReceipt->stores = collect();
                        $store = Store::findOrFail($item->pivot->store_id);
                        $store->loadMissing(['category', 'location']);
                        $item->quantity_original = $item->pivot->quantity_original;
                        $item->quantity_actual = $item->pivot->quantity_actual;
                        $item->quantity_bad_orders = $item->pivot->quantity_bad_orders;
                        $item->quantity_returns = $item->pivot->quantity_returns;
                        $store->items = collect();
                        $store->items->push((object)$item->only([
                            'id',
                            'code',
                            'name',
                            'quantity_original',
                            'quantity_actual',
                            'quantity_bad_orders',
                            'quantity_returns',
                        ]));
                        $newDeliveryReceipt->stores->push((object)$store->only(['id', 'code', 'name', 'category', 'location', 'items']));
                        $booklet->deliveryReceipts->push($newDeliveryReceipt);
                        $this->populateSummary($summary, $item);
                    }
                } else {
                    $newBooklet = new stdClass();
                    $newBooklet->id = $item->pivot->booklet_no;

                    $newDeliveryReceipt = $this->createNewDeliveryReceipt($purchaseOrder, $item);

                    $store = Store::findOrFail($item->pivot->store_id);
                    $store->loadMissing(['category', 'location']);

                    $item->quantity_original = $item->pivot->quantity_original;
                    $item->quantity_actual = $item->pivot->quantity_actual;
                    $item->quantity_bad_orders = $item->pivot->quantity_bad_orders;
                    $item->quantity_returns = $item->pivot->quantity_returns;
                    $store->items = collect();
                    $store->items->push((object)$item->only([
                        'id',
                        'code',
                        'name',
                        'quantity_original',
                        'quantity_actual',
                        'quantity_bad_orders',
                        'quantity_returns',
                    ]));
                    $newDeliveryReceipt->stores = collect();
                    $newDeliveryReceipt->stores->push((object)$store->only(['id', 'code', 'name', 'category', 'location', 'items']));

                    $newBooklet->deliveryReceipts = collect();
                    $newBooklet->deliveryReceipts->push($newDeliveryReceipt);

                    $booklets->push($newBooklet);
                    $this->populateSummary($summary, $item);
                }
            });
        });

        $booklets->each(function ($booklet) {
            $booklet->deliveryReceipts = $booklet->deliveryReceipts->sortBy('id')->values();
            $booklet->quantity_original = 0;
            $booklet->quantity_actual = 0;
            $booklet->quantity_bad_orders = 0;
            $booklet->quantity_returns = 0;
            $booklet->deliveryReceipts->each(function ($deliveryReceipt) use ($booklet) {
                $deliveryReceipt->stores->each(function ($store) use ($booklet, $deliveryReceipt) {
                    $deliveryReceipt->quantity_original = $store->items->sum('quantity_original');
                    $deliveryReceipt->quantity_actual = $store->items->sum('quantity_actual');
                    $deliveryReceipt->quantity_bad_orders = $store->items->sum('quantity_bad_orders');
                    $deliveryReceipt->quantity_returns = $store->items->sum('quantity_returns');

                    $booklet->quantity_original += $store->items->sum('quantity_original');
                    $booklet->quantity_actual += $store->items->sum('quantity_actual');
                    $booklet->quantity_bad_orders += $store->items->sum('quantity_bad_orders');
                    $booklet->quantity_returns += $store->items->sum('quantity_returns');
                });
            });
        });
        $booklets = $booklets->sortBy('id')->values();

		if (!$isGenerateCsvReport) {
			return response()->json([
				'data' => $booklets,
				'meta' => [
					'search_filters' => array_merge(
						$request->only(['from', 'to', 'by']),
						[
							'store' => ($searchStore ? $searchStore->only('code', 'name') : null),
							'category' => ($searchCategory ? $searchCategory->only('name') : null),
							'location' => ($searchLocation ? $searchLocation->only('name') : null),
						]
					),
					'summary' => $summary,
				]
			]);
		}
				
		$filename = Str::slug('DRR ' . $reportType . ' ' . $filenameSegment . ' ' . $request->input('from') . ' to ' . $request->input('to')) . '.csv';
		
		$headers = [
			'Content-type' => 'text/csv',
			'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => "0",
		];
        
        if ($reportType === 'summary') {
			$columns = [
				'Code',
				'Name',
				'Qty. (Orig.)',
				'Qty. (Act.)',
				'Qty. (BO)',
				'Qty. (Ret.)',
			];
			$callback = function() use ($columns, $summary) {
				$file = fopen('php://output', 'w');
				fputcsv($file, $columns);
				$summary->each(function ($item) use ($file) {
					$row = [
						'Code' => $item->code,
						'Name' => $item->name,
						'Qty. (Orig.)' => (int)$item->quantity_original,
						'Qty. (Act.)' => (int)$item->quantity_actual,
						'Qty. (BO)' => (int)$item->quantity_bad_orders,
						'Qty. (Ret.)' => (int)$item->quantity_returns,
					];
					fputcsv($file, $row);
				});
				fclose($file);
			};
		} else {
			$columns = [
				'BL No.',
				'DR No.',
				'Store',
				'Code',
				'Name',
				'Qty. (Orig.)',
				'Qty. (Act.)',
				'Qty. (BO)',
				'Qty. (Ret.)',
			];
			$callback = function() use ($columns, $booklets) {
				$file = fopen('php://output', 'w');
				fputcsv($file, $columns);
				$booklets->each(function ($booklet) use ($file) {
					$bookletNo = $booklet->id;
					$booklet->deliveryReceipts->each(function ($deliveryReceipt) use ($bookletNo, $file) {
						$deliveryReceiptNo = $deliveryReceipt->id;
						$deliveryReceipt->stores->each(function ($store) use ($bookletNo, $deliveryReceiptNo, $file) {
							$storeName = "({$store->code}) {$store->name}";
							$store->items->each(function ($item) use ($bookletNo, $deliveryReceiptNo, $file, $storeName) {
								$row = [
									'BL No.' => $bookletNo,
									'DR No.' => $deliveryReceiptNo,
									'Store' => $storeName,
									'Code' => $item->code,
									'Name' => $item->name,
									'Qty. (Orig.)' => (int)$item->quantity_original,
									'Qty. (Act.)' => (int)$item->quantity_actual,
									'Qty. (BO)' => (int)$item->quantity_bad_orders,
									'Qty. (Ret.)' => (int)$item->quantity_returns,
								];
								fputcsv($file, $row);
							});
						});
					});
				});
				fclose($file);
			};
		}

        return response()->stream($callback, 200, $headers);
    }

    private function createNewDeliveryReceipt(PurchaseOrder $purchaseOrder, Item $item)
    {
        $newDeliveryReceipt = new stdClass();
        $newDeliveryReceipt->id = $item->pivot->delivery_receipt_no;
        $newDeliveryReceipt->purchase_order = $purchaseOrder->only(['id', 'code', 'from', 'to']);

        return $newDeliveryReceipt;
    }
    
    private function populateSummary($summary, $item) {
		$item->quantity_original = +$item->quantity_original;
		$item->quantity_actual = +$item->quantity_actual;
		$item->quantity_bad_orders = +$item->quantity_bad_orders;
		$item->quantity_returns = +$item->quantity_returns;
		
		$existingItem = $summary->where('code', $item->code)->first();
		if ($existingItem) {
			$existingItem->quantity_original += $item->quantity_original;
			$existingItem->quantity_actual += $item->quantity_actual;
			$existingItem->quantity_bad_orders += $item->quantity_bad_orders;
			$existingItem->quantity_returns += $item->quantity_returns;
		} else {
			$summary->push($item);
		}
	}
}

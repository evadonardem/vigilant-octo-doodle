<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Location;
use App\Models\SalesInvoice;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use stdClass;

class ItemSalesMonitoringController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
		$from = Carbon::createFromFormat('Y-m', $request->input('from'))->firstOfMonth();
		$to = Carbon::createFromFormat('Y-m', $request->input('to'))->endOfMonth();
		$filterBy = $request->has('by') ? $request->input('by') : 'store';
        $salesBy = $request->has('sales_by') ? $request->input('sales_by') : 'quantity';
		$isGenerateCsvReport = $request->has('generate') && $request->input('generate') === 'csv';
		$reportType = $request->has('report_type') ? $request->input('report_type') : null;
		$filenameSegment = '';

        $salesInvoicesQuery = SalesInvoice::where('to', '>=', $from->format('Y-m-d'))
            ->where('to', '<=', $to->format('Y-m-d'));

        $storeId = null;
        $searchStore = null;

        $categoryId = null;
        $searchCategory = null;

        $locationId = null;
        $searchLocation = null;

        if ($filterBy === 'store' && $request->input('store_id')) {
			$storeId = $request->input('store_id');
			$searchStore = Store::findOrFail($storeId);
			$salesInvoicesQuery
				->whereHas('items', function ($query) use ($storeId) {
					$query->where('store_id', '=', $storeId);
				})
				->with('category')
				->with(['items' => function ($query) use ($storeId) {
					$query
						->where('store_id', '=', $storeId)
						->with(['store' => function ($query) use ($storeId) {
							$query
								->where('id', '=', $storeId)
								->with(['category', 'location']);
						}]);
				}]);
			$filenameSegment = "{$searchStore->code} {$searchStore->name}";
		} elseif ($filterBy === 'category' && $request->input('category_id')) {
			$categoryId = $request->input('category_id');
			$searchCategory = Category::findOrFail($categoryId);
			$salesInvoicesQuery
				->where('category_id', '=', $categoryId)
				->with(['category' => function ($query) use ($categoryId) {
					$query->where('id', '=', $categoryId);
				}])
				->with(['items.store' => function ($query) use ($categoryId) {
					$query->with(['category', 'location']);
				}]);
			$filenameSegment = $searchCategory->name;
		} elseif ($filterBy === 'location' && $request->input('location_id')) {
			$locationId = $request->input('location_id');
			$searchLocation = Location::findOrFail($locationId);
			$salesInvoicesQuery
				->whereHas('items', function ($query) use ($locationId) {
					$query->whereHas('store', function ($query) use ($locationId) {
						$query->where('location_id', '=', $locationId);
					});
				})
				->with('category')
				->with(['items' => function ($query) use ($locationId) {
					$query
						->whereHas('store.location', function ($query) use ($locationId) {
							$query->where('id', '=', $locationId);
						})
						->with(['store' => function ($query) use ($locationId) {
							$query
								->where('location_id', '=', $locationId)
								->with([
									'category',
									'location' => function ($query) use ($locationId) {
										$query->where('id', '=', $locationId);
									},
								]);
						}]);
				}]);
			$filenameSegment = $searchLocation->name;
		} else {
			$salesInvoicesQuery->with([
				'category',
				'items.store' => function ($query) {
					$query->with(['category', 'location']);
				},
			]);
			if ($filterBy === 'store') {
				$filenameSegment = 'All Stores';
			} elseif ($filterBy === 'category') {
				$filenameSegment = 'All Categories';
			} else {
				if ($filterBy === 'lcation') {
					$filenameSegment = 'All Locations';
				}
			}
		}

        $salesInvoices = $salesInvoicesQuery->get();

        if (!$isGenerateCsvReport) {
			return response()->json([]);
		}


        $salesInvoices = $salesInvoices->map(function ($salesInvoice) {
			$salesInvoice->from = Carbon::createFromFormat('Y-m-d', $salesInvoice->from)->format('Y-m');
			$salesInvoice->to = Carbon::createFromFormat('Y-m-d', $salesInvoice->to)->format('Y-m');
			return $salesInvoice;
		});

		// group sales invoices by year and month
		$salesInvoicesGroupByYearAndMonth = $salesInvoices->groupBy('to');

		// consolidate related stores sorted by store location, category, and name.
        $stores = $salesInvoices
			->map(function ($salesInvoice) {
				return $salesInvoice->items->map(function ($salesInvoiceItem) {
					return $salesInvoiceItem->store;
				});
			})
			->flatten(1)
			->unique()
			->sortBy('name')
			->sortBy('category.name')
			->sortBy('location.name')
			->values();

		// consolidate store sales by year and month
		foreach ($stores as &$store) {
			$_from = clone $from;
			$store->sales = collect();
			while ($_from <= $to) {
				$salesInvoicesChunk = $salesInvoicesGroupByYearAndMonth->get($_from->format('Y-m'));
				$salesInvoiceItems = $salesInvoicesChunk
					? $salesInvoicesChunk->filter(function ($salesInvoice) use ($store) {
						return $salesInvoice->items->where('store_id', '=', $store->id)->isNotEmpty();
					})->map(function ($salesInvoice) {
						return $salesInvoice->items;
					})->flatten(1)->values()
					: null;

				$items = [];
				if (!is_null($salesInvoiceItems) && $salesInvoiceItems->isNotEmpty()) {
					// filter sales invoice items by store and group by item
					$salesInvoiceItemsGroupByItem = $salesInvoiceItems->filter(function ($salesInvoiceItem) use ($store) {
							return $salesInvoiceItem->store_id == $store->id;
						})->groupBy('item_id');
					$items = $salesInvoiceItemsGroupByItem->map(function ($salesInvoiceItems) {
							$item = $salesInvoiceItems->first()->item->only(['id', 'code', 'name']);
                            $item['total_quantity'] = $salesInvoiceItems->sum('quantity');
							$item['total_sales'] = $salesInvoiceItems->sum('total_amount');
							return $item;
						})->sortBy('code')->values()->toArray();
				}

				$yearMonthSales = [
					'id' => $_from->format('y M'),
					'items' => $items,
				];
				$store->sales->push($yearMonthSales);
				$_from->addMonthsNoOverflow(1);
			};

			$store->sales = $store->sales->keyBy('id')->map(function ($yearMonthSales) {
				unset($yearMonthSales['id']);
				return $yearMonthSales;
			})->toArray();
		}

		$filename = Str::slug('ISR By ' . $salesBy . ' ' . $reportType . ' ' . $filenameSegment . ' ' . $request->input('from') . ' to ' . $request->input('to')) . '.csv';

		$headers = [
			'Content-type' => 'text/csv',
			'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => "0",
		];

		$callback = function() use ($stores, $salesBy) {
			$file = fopen('php://output', 'w');

			// initialize csv map
			$csvMap = [
				'Location' => null,
				'Category' => null,
				'Store' => null,
			];

            // arrange data set
			foreach ($stores as $store) {
				$sales = $store->sales;
				foreach ($sales as $key => $yearMonthSales) {
					if (!array_key_exists($key, $csvMap)) {
						$csvMap[$key] = collect();
					}
					foreach ($yearMonthSales['items'] as $item) {
						$csvMap[$key]->push($item);
					}
				}
			}

            // remove empty data set
            foreach ($stores as $store) {
                $sales = $store->sales;
                foreach ($sales as $key => $yearMonthSales) {
                    if (array_key_exists($key, $csvMap) && $csvMap[$key]->isEmpty()) {
                        unset($csvMap[$key]);
                        continue;
                    }
                }
            }

            // convert data set to array
            foreach ($stores as $store) {
                $sales = $store->sales;
                foreach ($sales as $key => $yearMonthSales) {
                    if (array_key_exists($key, $csvMap)) {
                        $csvMap[$key] = $csvMap[$key]->sortBy('code')->pluck('code')->unique()->values()->toArray();
                    }
                }
            }

			// populate csv line headers
			$lineHeader1 = [];
			$lineHeader2 = [];
			foreach ($csvMap as $key => $value) {
				if (in_array($key, ['Location', 'Category', 'Store'])) {
					$lineHeader1[] = '';
				} else {
					$arr = [$key];
					$arr = array_pad($arr, count($value), '');
					$lineHeader1 = array_merge($lineHeader1, $arr);
				}
			}
			foreach ($csvMap as $key => $value) {
				if (in_array($key, ['Location', 'Category', 'Store'])) {
					$lineHeader2[] = $key;
				} else {
					$arr = array_map(function ($item) {
						return $item;
					}, $value);
					$lineHeader2 = array_merge($lineHeader2, $arr);
				}
			}
			fputcsv($file, $lineHeader1);
			fputcsv($file, $lineHeader2);

			foreach ($stores as $store) {
				$row = [];
				foreach ($csvMap as $key => $value) {
					if ($key === 'Location') {
						$row[] = isset($store['location']) ? $store['location']['name'] : '-';
					} elseif ($key === 'Category') {
						$row[] = isset($store['category']) ? $store['category']['name'] : '-';
					} elseif ($key === 'Store') {
						$row[] = "({$store['code']}) {$store['name']}";
					} else {
						$storeSales = $store->sales;
						$arr = array_map(function ($itemCode) use ($key, $storeSales, $salesBy) {
                            $totalQuantity = 0;
							$totalSales = 0;
							$storeYearMonthSales = isset($storeSales[$key]) ? $storeSales[$key] : null;
							if ($storeYearMonthSales && count($storeYearMonthSales['items']) > 0) {
								$storeYearMonthSalesItems = collect($storeYearMonthSales['items'])->keyBy('code');
								$targetItem = $storeYearMonthSalesItems->get($itemCode);
                                $totalQuantity = $targetItem ? $targetItem['total_quantity'] : 0;
								$totalSales = $targetItem ? $targetItem['total_sales'] : 0;
							}
							return $salesBy === 'quantity' ? $totalQuantity : $totalSales;
						}, $value);
						$row = array_merge($row, $arr);
					}
				}

				fputcsv($file, $row);
			};

			fclose($file);
		};

        return response()->stream($callback, 200, $headers);
    }
}

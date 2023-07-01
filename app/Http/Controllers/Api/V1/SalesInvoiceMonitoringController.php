<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Location;
use App\Models\SalesInvoice;
use App\Models\Store;
use Illuminate\Support\Str;
use stdClass;

class SalesInvoiceMonitoringController extends Controller
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

        $salesInvoicesQuery = SalesInvoice::where('to', '>=', $request->input('from'))
            ->where('to', '<=', $request->input('to'));

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

        foreach ($salesInvoices as $salesInvoice) {
            $salesInvoice->total_sales = $salesInvoice->items->sum('total_amount');
        }

        $booklets = collect();
        $salesInvoiceItems = collect();
        foreach ($salesInvoices as $salesInvoice) {
            $booklet = $booklets->where('id', '=', $salesInvoice->booklet_no)->first();
            if ($booklet) {
				$salesInvoiceItems = $salesInvoiceItems->merge($salesInvoice->items);
                $booklet->invoices->push($salesInvoice);
            } else {
                $newBooklet = new stdClass();
                $newBooklet->id = $salesInvoice->booklet_no;
                $newBooklet->invoices = collect();
                $newBooklet->invoices->push($salesInvoice);

				$salesInvoiceItems = $salesInvoiceItems->merge($salesInvoice->items);
                $booklets->push($newBooklet);
            }
        }

        $booklets->each(function ($booklet) {
            $booklet->invoices = $booklet->invoices->sortBy('invoice_no')->values();
            $booklet->total_sales = $booklet->invoices->sum('total_sales');
            $booklet->vat_amount = $booklet->invoices->sum('vat_amount');
            $booklet->total_sales_less_vat = $booklet->invoices->sum('total_sales_less_vat');
            $booklet->total_amount_due = $booklet->invoices->sum('total_amount_due');
        });

        $booklets = $booklets->sortBy('id')->values();
        $summary = $this->initSummary($salesInvoiceItems);

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

		$filename = Str::slug('SIR ' . $reportType . ' ' . $filenameSegment . ' ' . $request->input('from') . ' to ' . $request->input('to')) . '.csv';

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
				'Total Sales',
				'Less VAT',
				'Amt. Net less VAT',
				'Total Amt. Due',
			];
			$callback = function() use ($columns, $summary) {
				$file = fopen('php://output', 'w');
				fputcsv($file, $columns);
				$summary->each(function ($item) use ($file) {
					$row = [
						'Code' => $item->code,
						'Name' => $item->name,
						'Total Sales' => $item->total_sales,
						'Less VAT' => $item->vat_amount,
						'Amt. Net less VAT' => $item->total_sales_less_vat,
						'Total Amt. Due' => $item->total_amount_due,
					];
					fputcsv($file, $row);
				});
				fclose($file);
			};
		} else {
			$columns = [
				'BL No.',
				'Invoice No.',
				'Store',
				'Location',
				'Item',
				'Qty.',
				'Price',
				'Total Sales',
				'Less VAT',
				'Amt. Net less VAT',
				'Total Amt. Due',
			];
			$callback = function() use ($columns, $booklets) {
				$file = fopen('php://output', 'w');
				fputcsv($file, $columns);
				$booklets->each(function ($booklet) use ($file) {
					$bookletNo = $booklet->id;
					$booklet->invoices->each(function ($invoice) use ($bookletNo, $file) {
						$invoiceNo = $invoice->invoice_no;
						$invoice->items->each(function ($invoiceItem) use ($bookletNo, $invoice, $invoiceNo, $file) {
							$storeName = "({$invoiceItem->store->code}) {$invoiceItem->store->name}";
							$locationName = $invoiceItem->store->location->name;
							$itemName = "({$invoiceItem->item->code}) {$invoiceItem->item->name}";
							$invoice->total_sales = $invoiceItem->total_amount;
							$row = [
								'BL No.' => $bookletNo,
								'Invoice No.' => $invoiceNo,
								'Store' => $storeName,
								'Location' => $locationName,
								'Item' => $itemName,
								'Qty.' => $invoiceItem->quantity,
								'Price' => $invoiceItem->price,
								'Total Sales' => $invoice->total_sales,
								'Less VAT' => $invoice->vat_amount,
								'Amt. Net less VAT' => $invoice->total_sales_less_vat,
								'Total Amt. Due' => $invoice->total_amount_due,
							];
							fputcsv($file, $row);
						});
					});
				});
				fclose($file);
			};
		}

        return response()->stream($callback, 200, $headers);
    }

    private function initSummary($salesInvoiceItems)
    {
		$summary = $salesInvoiceItems->map(function ($salesInvoiceItem) {
			return $salesInvoiceItem->item;
		})->unique()->values()->keyBy('id');

		$salesInvoiceItemsGroupByItem = $salesInvoiceItems->groupBy('item_id');
		foreach ($salesInvoiceItemsGroupByItem as $key => $value) {
			$summations = collect();
			$value->groupBy('sales_invoice_id')->each(function ($salesInvoiceItemsByInvoice) use ($summations) {
				$salesInvoice = $salesInvoiceItemsByInvoice->first()->salesInvoice;
				$salesInvoice->total_sales = $salesInvoiceItemsByInvoice->sum('total_amount');
				$summations->push((object)$salesInvoice->only(['total_sales', 'vat_amount', 'total_sales_less_vat', 'total_amount_due']));
			});

			$summary[$key]->total_sales = $summations->sum('total_sales');
			$summary[$key]->vat_amount = $summations->sum('vat_amount');
			$summary[$key]->total_sales_less_vat = $summations->sum('total_sales_less_vat');
			$summary[$key]->total_amount_due = $summations->sum('total_amount_due');
		}

		return $summary->values();
	}
}

<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Location;
use App\Models\SalesInvoice;
use App\Models\Store;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
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
				->whereHas('items.store', function ($query) use ($storeId) {
					$query->where('id', '=', $storeId);
				})
				->with('category')
				->with(['items.store' => function ($query) use ($storeId) {
					$query
						->where('id', '=', $storeId)
						->with(['category', 'location']);
				}]);
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
		} elseif ($filterBy === 'location' && $request->input('location_id')) {
			$locationId = $request->input('location_id');
			$searchLocation = Location::findOrFail($locationId);
			$salesInvoicesQuery
				->whereHas('items.store', function ($query) use ($locationId) {
					$query->where('location_id', '=', $locationId);
				})
				->with('category')
				->with(['items.store' => function ($query) use ($locationId) {
					$query
						->where('location_id', '=', $locationId)
						->with('category');
				}]);
		} else {
			$salesInvoicesQuery->with([
				'category',
				'items.store' => function ($query) {
					$query->with(['category', 'location']);
				},
			]);
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
						$request->only(['from', 'to']),
						['store' => ($searchCategory ? $searchCategory->only('name') : null)]
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
				/*$booklets->each(function ($booklet) use ($file) {
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
				});*/
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

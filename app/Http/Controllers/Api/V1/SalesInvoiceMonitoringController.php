<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\SalesInvoice;
use App\Models\Store;
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
        $salesInvoicesQuery = SalesInvoice::with('store')
            ->where('to', '>=', $request->input('from'))
            ->where('to', '<=', $request->input('to'));

        $storeId = null;
        $searchStore = null;
        if ($request->input('store_id')) {
            $storeId = $request->input('store_id');
            $searchStore = Store::findOrFail($storeId);
            $salesInvoicesQuery->where('store_id', '=', $storeId);
        }

        $salesInvoices = $salesInvoicesQuery->get();

        $booklets = collect();
        foreach ($salesInvoices as $salesInvoice) {
            $booklet = $booklets->where('id', '=', $salesInvoice->booklet_no)->first();
            if ($booklet) {
                $booklet->invoices->push($salesInvoice);
            } else {
                $newBooklet = new stdClass();
                $newBooklet->id = $salesInvoice->booklet_no;
                $newBooklet->invoices = collect();
                $newBooklet->invoices->push($salesInvoice);

                $booklets->push($newBooklet);
            }
        }

        $booklets->each(function ($booklet) {
            $booklet->invoices = $booklet->invoices->sortBy('invoice_no')->values();
            $booklet->total_sales = number_format($booklet->invoices->sum('total_sales'), 2, '.', '');
            $booklet->vat_amount = number_format($booklet->invoices->sum('vat_amount'), 2, '.', '');
            $booklet->total_sales_less_vat = number_format($booklet->invoices->sum('total_sales_less_vat'), 2, '.', '');
            $booklet->total_amount_due = number_format($booklet->invoices->sum('total_amount_due'), 2, '.', '');
        });

        $booklets = $booklets->sortBy('id')->values();

        return response()->json([
            'data' => $booklets,
            'meta' => [
                'search_filters' => array_merge(
                    $request->only(['from', 'to']),
                    ['store' => ($searchStore ? $searchStore->only('code', 'name') : null)]
                )
            ]
        ]);
    }
}

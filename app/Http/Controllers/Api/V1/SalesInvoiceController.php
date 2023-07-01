<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalesInvoiceRequest;
use App\Models\SalesInvoice;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class SalesInvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if ($request->user()->cannot('View sales invoice')) {
            abort(403);
        }

        $search = $request->input('search') ?? [];
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $salesInvoices = SalesInvoice::orderBy('from', 'desc')
            ->orderBy('to', 'desc')
            ->with('category');

        if ($search && !empty($search['value'])) {
            $searchTerm = $search['value'];
            $salesInvoices = $salesInvoices->where(function ($query) use ($searchTerm) {
                $query
                    ->orWhere('booklet_no', 'like', '%' . $searchTerm . '%')
                    ->orWhere('invoice_no', 'like', '%' . $searchTerm . '%');
            });
        }

        $salesInvoices = $salesInvoices->paginate($perPage);

        foreach ($salesInvoices as $salesInvoice) {
            $salesInvoice->total_sales = $salesInvoice->items->sum('total_amount');
        }

        return response()->json($salesInvoices);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreSalesInvoiceRequest $request)
    {
        if ($request->user()->cannot('Create sales invoice')) {
            abort(403);
        }

        $attributes = $request->only([
            'booklet_no',
            'invoice_no',
            'category_id',
            'date_countered',
            'from',
            'to',
        ]);

        $attributes['vat_rate'] = 0.10715;

        return SalesInvoice::create($attributes);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\SalesInvoice  $salesInvoice
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, SalesInvoice $salesInvoice)
    {
        if ($request->user()->cannot('View sales invoice')) {
            abort(403);
        }

        $salesInvoice->loadMissing('category');
        $salesInvoice->total_sales = $salesInvoice->items->sum('total_amount');

        return response()->json(['data' => $salesInvoice]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\SalesInvoice  $salesInvoice
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, SalesInvoice $salesInvoice)
    {
        if ($request->user()->cannot('Delete sales invoice')) {
            abort(403);
        }

        $salesInvoice->delete();

        return response()->noContent();
    }
}

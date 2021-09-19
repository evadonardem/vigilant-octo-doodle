<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class SalesInvoiceItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, SalesInvoice $salesInvoice)
    {
        $search = $request->input('search') ?? [];
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $salesInvoiceItems = SalesInvoiceItem::where('sales_invoice_id', $salesInvoice->id);

        if ($search && !empty($search['value'])) {
            $searchTerm = $search['value'];
            // $salesInvoiceItems = $salesInvoiceItems->where(function ($query) use ($searchTerm) {
            //     $query
            //         ->orWhere('code', 'like', '%' . $searchTerm . '%')
            //         ->orWhere('location', 'like', '%' . $searchTerm . '%');
            // });
        }

        $salesInvoiceItems = $salesInvoiceItems->paginate($perPage);

        return response()->json($salesInvoiceItems);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, SalesInvoice $salesInvoice)
    {
        $attributes = $request->only(['store_id', 'item_id', 'quantity']);
        $attributes['sales_invoice_id'] = $salesInvoice->id;

        SalesInvoiceItem::create($attributes);

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\SalesInvoiceItem  $salesInvoiceItem
     * @return \Illuminate\Http\Response
     */
    public function show(SalesInvoiceItem $salesInvoiceItem)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\SalesInvoiceItem  $salesInvoiceItem
     * @return \Illuminate\Http\Response
     */
    public function edit(SalesInvoiceItem $salesInvoiceItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\SalesInvoiceItem  $salesInvoiceItem
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, SalesInvoiceItem $salesInvoiceItem)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\SalesInvoiceItem  $salesInvoiceItem
     * @return \Illuminate\Http\Response
     */
    public function destroy(SalesInvoice $salesInvoice, SalesInvoiceItem $salesInvoiceItem)
    {
        if ($salesInvoiceItem->sales_invoice_id == $salesInvoice->id) {
            $salesInvoiceItem->delete();
        }

        return response()->noContent();
    }
}

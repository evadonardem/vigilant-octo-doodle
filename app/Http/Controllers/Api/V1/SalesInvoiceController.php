<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalesInvoiceRequest;
use App\Models\SalesInvoice;
use Illuminate\Http\Request;

class SalesInvoiceController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreSalesInvoiceRequest $request)
    {
        $attributes = $request->only(['booklet_no', 'invoice_no', 'category_id', 'date_countered', 'from', 'to', 'total_sales', 'vat_rate']);

        return SalesInvoice::create($attributes);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use App\Models\Store;
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

    public function indexStoreItems(Request $request, SalesInvoice $salesInvoice, Store $store)
    {
        $storeItems = Item::orderBy('name', 'asc')
            ->whereHas('stores', function ($query) use ($store) {
                $query->where('stores.id', $store->id);
            })
            ->get();

        $salesInvoiceItemsKeyByItemId = $salesInvoice->items
            ->where('store_id', '=', $store->id)
            ->values()
            ->keyBy('item_id');

        foreach ($storeItems as $item) {
            if ($salesInvoiceItemsKeyByItemId[$item->id] ?? false) {
                $item->quantity = $salesInvoiceItemsKeyByItemId[$item->id]->quantity;
            }
        }

        return response()->json(['data' => $storeItems]);
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

        if ($attributes['quantity'] > 0) {
            SalesInvoiceItem::updateOrCreate(
                [
                    'sales_invoice_id' => $salesInvoice->id,
                    'store_id' => $attributes['store_id'],
                    'item_id' => $attributes['item_id'],
                ],
                [
                    'quantity' => $attributes['quantity'],
                ]
            );
        } else {
            SalesInvoiceItem::where([
                'sales_invoice_id' => $salesInvoice->id,
                'store_id' => $attributes['store_id'],
                'item_id' => $attributes['item_id'],
            ])->delete();
        }

        return response()->noContent();
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

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Store;
use App\Models\StoreItemPrice;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class StoreItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, Store $store)
    {
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;
        $search = $request->input('search') ?? [];

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $itemsQuery = Item::orderBy('name', 'asc')
            ->whereHas('stores', function ($query) use ($store) {
                $query->where('stores.id', $store->id);
            });

        if ($search && !empty($search['value'])) {
            $itemsQuery->where(function ($query) use ($search) {
                $query
                    ->where('code', 'like', '%' . $search['value'] . '%')
                    ->orWhere('name', 'like', '%' . $search['value'] . '%');
            });
        }

        $items = $itemsQuery->paginate($perPage);
        $latestStoreItemsPrice = StoreItemPrice::orderBy('effectivity_date', 'desc')
            ->distinct(['store_id', 'item_id'])
            ->where('store_id', '=', $store->id)
            ->whereIn('item_id', $items->pluck('id'))
            ->get();
        $items->each(function ($item) use ($latestStoreItemsPrice) {
            $latestStoreItemPrice = $latestStoreItemsPrice->where('item_id', $item->id)->first();
            $item->latest_effectivity_date = $latestStoreItemPrice->effectivity_date;
            $item->latest_amount = $latestStoreItemPrice->amount;
        });

        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Store $store, Item $item)
    {
        $attributes = $request->only(['item_id', 'effectivity_date', 'amount']);
        $store->items()->attach($attributes['item_id'], [
            'effectivity_date' => $attributes['effectivity_date'],
            'amount' => $attributes['amount'],
        ]);

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function show(Store $store, Promodiser $promodiser)
    {

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function edit(Store $store)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Store $store, Promodiser $promodiser)
    {

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function destroy(Store $store, Promodiser $promodiser)
    {

    }
}

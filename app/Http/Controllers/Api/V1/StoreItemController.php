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
    public function __construct()
    {
        $this->middleware('can:View registered store item pricing')->only(['index', 'show']);
        $this->middleware('can:Create or update store item pricing')->only(['itemPricing','store']);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, Store $store)
    {
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);
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
        $items->each(function ($item) use ($latestStoreItemsPrice, $store) {
            $latestStoreItemPrice = $latestStoreItemsPrice->where('item_id', $item->id)->first();
            $item->latest_effectivity_date = $latestStoreItemPrice->effectivity_date;
            $item->latest_amount = $latestStoreItemPrice->amount;
            $item->store_id = $store->id;
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

        $storeItemPrice = StoreItemPrice::distinct(['store_id', 'item_id'])
            ->where([
                'effectivity_date' => $attributes['effectivity_date'],
                'store_id' => $store->id,
                'item_id' => $attributes['item_id']
            ])
            ->first();

        if ($storeItemPrice) {
            if ($attributes['amount'] <= 0) {
                $storeItemPrice->delete();
            } else {
                $storeItemPrice->amount = $attributes['amount'];
                $storeItemPrice->save();
            }
        } else {
            if ($attributes['amount'] > 0) {
                $store->items()->attach($attributes['item_id'], [
                    'effectivity_date' => $attributes['effectivity_date'],
                    'amount' => $attributes['amount'],
                ]);
            }
        }

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, Store $store, Item $item)
    {
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search') ?? [];

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $storeItemPricing = StoreItemPrice::orderBy('effectivity_date', 'desc')
            ->where([
                'store_id' => $store->id,
                'item_id' => $item->id,
            ])
            ->paginate($perPage);

        return response()->json($storeItemPricing);
    }

    public function itemPricing(Request $request, Store $store, string $effectivityDate)
    {
        $items = Item::orderBy('name', 'asc')->get();

        $storeItemsPriceByEffectivity = StoreItemPrice::distinct(['store_id', 'item_id'])
            ->where([
                'effectivity_date' => $effectivityDate,
                'store_id' => $store->id,
            ])
            ->whereIn('item_id', $items->pluck('id'))
            ->get()
            ->keyBy('item_id');

        $items->each(function ($item) use ($storeItemsPriceByEffectivity) {
            $itemPrice = $storeItemsPriceByEffectivity->get($item->id);
            $item->amount = $itemPrice ? $itemPrice->amount : 0;
        });

        return response()->json(['data' => $items]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStoreRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class StoreController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $search = $request->input('search') ?? [];
        $storesQuery = Store::orderBy('name', 'asc')
            ->orderBy('address_line', 'asc');

        if ($search && !empty($search['value'])) {
            $storesQuery
                ->where('code', 'like', '%' . $search['value'] . '%')
                ->orWhere('name', 'like', '%' . $search['value'] . '%');
        }

        if ($request->input('all')) {
            $stores = $storesQuery->get();

            return response()->json(['data' => $stores]);
        }

        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $stores = $storesQuery->paginate($perPage);

        return response()->json($stores);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreStoreRequest $request)
    {
        $attributes = $request->only(['code', 'name', 'address_line']);

        Store::create($attributes);

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function show(Store $store)
    {
        return response()->json(['data' => $store]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateStoreRequest $request, Store $store)
    {
        $attributes = $request->only(['code', 'name', 'address_line']);

        $store->fill($attributes)->save();

        return response()->json(['data' => $store]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function destroy(Store $store)
    {
        $store->delete();

        return response()->noContent();
    }
}
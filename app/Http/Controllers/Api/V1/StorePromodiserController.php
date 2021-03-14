<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Promodiser;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class StorePromodiserController extends Controller
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

        $storesQuery = Promodiser::where('store_id', '=', $store->id)
            ->orderBy('name', 'asc');

        if ($search && !empty($search['value'])) {
            $storesQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search['value'] . '%');
            });
        }

        $stores = $storesQuery->paginate($perPage);

        return response()->json($stores);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Store $store)
    {
        $attributes = $request->only(['name']);
        $store->promodisers()->save(Promodiser::make($attributes));

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
        if ($store->promodisers->contains($promodiser)) {
            return response()->json(['data' => $promodiser]);
        }

        return null;
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
        if ($store->promodisers->contains($promodiser)) {
            $promodiser->fill($request->only(['name']));
            $promodiser->save();
        }

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function destroy(Store $store, Promodiser $promodiser)
    {
        if ($store->promodisers->contains($promodiser)) {
            $promodiser->delete();
        }

        return response()->noContent();
    }
}

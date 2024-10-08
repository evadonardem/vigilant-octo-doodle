<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromodiserRequest;
use App\Http\Requests\UpdatePromodiserRequest;
use App\Models\Promodiser;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class StorePromodiserController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:View registered store promodiser')->only('index');
        $this->middleware('can:Create or register new store promodiser')->only('store');
        $this->middleware('can:Update existing store promodiser')->only('update');
        $this->middleware('can:Delete or unregister store promodiser')->only('destroy');
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
    public function store(StorePromodiserRequest $request, Store $store)
    {
        $attributes = $request->only(['name', 'contact_no']);
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
            $promodiser->store;
            return response()->json(['data' => $promodiser]);
        }

        return null;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePromodiserRequest $request, Store $store, Promodiser $promodiser)
    {
        if ($store->promodisers->contains($promodiser)) {
            $promodiser
                ->fill($request->only(['name', 'contact_no']))
                ->save();
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

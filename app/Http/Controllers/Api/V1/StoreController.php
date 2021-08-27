<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStoreRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Models\Category;
use App\Models\Location;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

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
            ->orderBy('address_line', 'asc')
            ->with('category')
            ->with('location');

        if ($search && !empty($search['value'])) {
            $storesQuery
                ->where('code', 'like', '%' . $search['value'] . '%')
                ->orwhere('name', 'like', '%' . $search['value'] . '%')
                ->orwhereJsonContains('tags', strtoupper($search['value']));
        }

        if ($request->has('category_id')) {
            $categoryId = $request->input('category_id');
            if ($categoryId) {
                $storesQuery->where('category_id', '=', $categoryId);
            }
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
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexStoreCategories()
    {
        $categories = Category::orderBy('name', 'asc')->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexStoreLocations()
    {
        $locations = Location::orderBy('name', 'asc')->get();

        return response()->json(['data' => $locations]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreStoreRequest $request)
    {
        $storeAttributes = $request->only(['code', 'name', 'address_line']);

        $selectedCategory = $request->only(['category']);
        $isNewCategory = $selectedCategory['category']['__isNew__'] ?? false;

        $categoryId = null;
        if ($isNewCategory) {
            $category = Category::create([
                'name' => $selectedCategory['category']['label'],
            ]);
            $categoryId = $category->id;
        } else {
            $categoryId = $selectedCategory['category']['value'];
        }

        $selectedLocation = $request->only(['location']);
        $isNewLocation = $selectedLocation['location']['__isNew__'] ?? false;

        $locationId = null;
        if ($isNewLocation) {
            $location = Location::create([
                'name' => $selectedLocation['location']['label'],
            ]);
            $locationId = $location->id;
        } else {
            $locationId = $selectedLocation['location']['value'];
        }

        $storeAttributes['category_id'] = $categoryId;
        $storeAttributes['location_id'] = $locationId;

        Store::create($storeAttributes);

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
        $store->loadMissing(['category', 'location']);
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
        $storeAttributes = $request->only(['code', 'name', 'address_line', 'tags']);

        array_walk($storeAttributes['tags'], function (&$value) {
            $value = strtoupper($value);
        });

        $selectedCategory = $request->only(['category']);
        $isNewCategory = $selectedCategory['category']['__isNew__'] ?? false;

        $categoryId = null;
        if ($isNewCategory) {
            $category = Category::create([
                'name' => strtoupper($selectedCategory['category']['label']),
            ]);
            $categoryId = $category->id;
        } else {
            $categoryId = $selectedCategory['category']['value'] ?? null;
        }

        $selectedLocation = $request->only(['location']);
        $isNewLocation = $selectedLocation['location']['__isNew__'] ?? false;

        $locationId = null;
        if ($isNewLocation) {
            $location = Location::create([
                'name' => strtoupper($selectedLocation['location']['label']),
            ]);
            $locationId = $location->id;
        } else {
            $locationId = $selectedLocation['location']['value'] ?? null;
        }

        $storeAttributes['category_id'] = $categoryId;
        $storeAttributes['location_id'] = $locationId;
        $store->fill($storeAttributes)->save();

        $store->category;
        $store->location;

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

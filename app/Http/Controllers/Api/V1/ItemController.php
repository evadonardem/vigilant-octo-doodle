<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $start = $request->input('start') ?? 0;
        $perPage = $request->input('length') ?? 10;
        $page = ($start/$perPage) + 1;
        $search = $request->input('search') ?? [];

        Paginator::currentPageResolver(function () use ($page) {
            return $page;
        });

        $itemsQuery = Item::orderBy('name', 'asc');

        if ($search && !empty($search['value'])) {
            $itemsQuery
                ->where('code', 'like', '%' . $search['value'] . '%')
                ->orWhere('name', 'like', '%' . $search['value'] . '%');
        }

        $items = $itemsQuery->paginate($perPage);

        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreItemRequest $request)
    {
        $attributes = $request->only(['code', 'name']);

        Item::create($attributes);

        return response()->noContent();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateItemRequest $request, Item $item)
    {
        $item->fill($request->only(['code', 'name']))->save();

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function destroy(Item $item)
    {
        $item->delete();

        return response()->noContent();
    }
}

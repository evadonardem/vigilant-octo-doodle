<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsumableItemRequest;
use App\Http\Requests\UpdateConsumableItemRequest;
use App\Models\ConsumableItem;
use App\Services\ConsumableItemService;

class ConsumableItemController extends Controller
{
    public function __construct(
        private ConsumableItemService $consumableItemService
    ) {
        //
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->consumableItemService->getAll();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(StoreConsumableItemRequest $request)
    {
        $this->consumableItemService->create($request->all());

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(ConsumableItem $consumableItem)
    {
        return $consumableItem;
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateConsumableItemRequest $request, ConsumableItem $consumableItem)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy(ConsumableItem $consumableItem)
    {
        $this->consumableItemService->delete($consumableItem);

        return response()->noContent();
    }
}

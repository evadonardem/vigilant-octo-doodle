<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StockCard;
use App\Models\StockCardDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockCardDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(StockCard $stockCard)
    {
        $itemIds = $stockCard->store->items->pluck('id')->unique();
        $stockCardDetails = $stockCard->details()
            ->orderBy('created_at', 'desc')
            ->get()
            ->unique(function ($detail) {
                return $detail->type . ' ' . $detail->item_id;
            })
            ->values();
        $itemIds->each(function ($itemId) use ($stockCardDetails) {
            $itemInventory = $stockCardDetails->where('item_id', $itemId);
            if ($itemInventory->count() > 0) {
                $itemEndingInventoryQuantity = $itemInventory
                    ->whereIn('type', ['beginning_inventory', 'delivered_inventory'])
                    ->sum('quantity');
                $itemEndingInventoryQuantity -= $itemInventory
                    ->whereIn('type', ['sra_inventory', 'sold_inventory'])
                    ->sum('quantity');

                $itemEndingInventory = new StockCardDetail();
                $itemEndingInventory->id = -($itemInventory->sum('id'));
                $itemEndingInventory->type = 'ending_inventory';
                $itemEndingInventory->item_id = $itemId;
                $itemEndingInventory->quantity = $itemEndingInventoryQuantity;
                $stockCardDetails->prepend($itemEndingInventory);
            }            
        });

        return response()->json(['data' => $stockCardDetails]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, StockCard $stockCard)
    {
        $attributes = $request->only(['type', 'item_id', 'quantity']);
        $attributes['quantity'] = is_numeric($attributes['quantity']) ? +$attributes['quantity'] : null;

        $itemInventory = $stockCard->details()
            ->where('type', $attributes['type'])
            ->where('item_id', $attributes['item_id'])
            ->orderBy('created_at', 'desc')
            ->first();
        
        if (
            (!$itemInventory && is_numeric($attributes['quantity'])) ||
            ($itemInventory && $itemInventory->quantity !== $attributes['quantity'])
        ) {
            $stockCard->details()->create($attributes);
        }

        return response()->noContent();
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\StockCard;
use App\Http\Requests\GetReportStockCardsMonitoringRequest;
use stdClass;

class StockCardsMonitoringController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:Generate stock cards monitoring report')->only(['index', 'availableItems']);
    }

    public function index(GetReportStockCardsMonitoringRequest $request)
    {
        $from = $request->input('from');
        $to = $request->input('to');
        $locationId = $request->input('location_id');
        
        $location = Location::where('id', '=', $locationId)->first();
        $stockCards = $this->getStockCards($from, $to, $locationId);
        $items = $this->getAvailableItems($from, $to, $locationId);

        $storeStockCards = collect();
        foreach ($stockCards as $stockCard) {
            $storeStockCard = $storeStockCards->where('id', '=', $stockCard->store_id)->first();
            if ($storeStockCard) {
                $stockCard->details->each(function ($detail) use ($storeStockCard, $items) {
                    $items->each(function ($item) use ($detail, $storeStockCard) {
                        if (isset($storeStockCard->{$item->code . '_' . $detail->type})) {
                            $storeStockCard->{$item->code . '_' . $detail->type} += $detail->quantity;
                        } else {
                            $storeStockCard->{$item->code . '_' . $detail->type} = $item->code === $detail->item->code
                                ? $detail->quantity
                                : 0;
                        }
    
                        if (!isset($storeStockCard->{$item->code . '_ending_inventory'})) {
                            $storeStockCard->{$item->code . '_ending_inventory'} = 0;
                        }
            
                        if (in_array($detail->type, ['beginning_inventory', 'delivered_inventory'])) {
                            $storeStockCard->{$item->code . '_ending_inventory'} += $item->code === $detail->item->code
                                ? $detail->quantity
                                : 0;
                        } else {
                            if (in_array($detail->type, ['sra_inventory', 'sold_inventory'])) {
                                $storeStockCard->{$item->code . '_ending_inventory'} -= $item->code === $detail->item->code
                                    ? $detail->quantity
                                    : 0;
                            }
                        }
                    });
                });
            } else {
                $storeStockCards->push($this->createNewStoreStockCard($stockCard, $items));
            }
        }

        return response()->json([
            'data' => $storeStockCards,
            'meta' => [
                'search_filters' => array_merge(
                    $request->only(['from', 'to']),
                    ['location' => $location]
                )
            ]
        ]);
    }

    public function availableItems(GetReportStockCardsMonitoringRequest $request)
    {
        $from = $request->input('from');
        $to = $request->input('to');
        $locationId = $request->input('location_id');
        
        $items = $this->getAvailableItems($from, $to, $locationId);

        return response()->json(['data' => $items]);
    }

    private function getAvailableItems(string $from, string $to, int $locationId)
    {
        $stockCards = $this->getStockCards($from, $to, $locationId);
        
        $items = collect();
        $stockCards->each(function ($stockCard) use (&$items) {
            $stockCard->details->each(function ($detail) use (&$items) {
                $items = $items->push($detail->item);
            });
        });
        
        return $items->unique()->sortBy('name')->values();
    }

    private function getStockCards(string $from, string $to, int $locationId)
    {
        $stockCardsQuery = StockCard::whereHas('store.location', function($query) use ($locationId) {
            $query->where('id', '=', $locationId);
        })
            ->where('to', '>=', $from)
            ->where('to', '<=', $to);
        
        return $stockCardsQuery->get();
    }

    private function createNewStoreStockCard($stockCard, $items)
    {
        $newStoreStockCard = new stdClass();
        $newStoreStockCard->id = $stockCard->store_id;
        $newStoreStockCard->store = $stockCard->store;

        $stockCard->details->each(function ($detail) use ($newStoreStockCard, $items) {
            $items->each(function ($item) use ($detail, $newStoreStockCard) {
                $newStoreStockCard->{$item->code . '_' . $detail->type} = $item->code === $detail->item->code
                    ? $detail->quantity
                    : 0;
                
                if (!isset($newStoreStockCard->{$item->code . '_ending_inventory'})) {
                    $newStoreStockCard->{$item->code . '_ending_inventory'} = 0;
                }

                if (in_array($detail->type, ['beginning_inventory', 'delivered_inventory'])) {
                    $newStoreStockCard->{$item->code . '_ending_inventory'} += $item->code === $detail->item->code
                        ? $detail->quantity
                        : 0;
                } else {
                    if (in_array($detail->type, ['sra_inventory', 'sold_inventory'])) {
                        $newStoreStockCard->{$item->code . '_ending_inventory'} -= $item->code === $detail->item->code
                            ? $detail->quantity
                            : 0;
                    }
                }
            });
        });

        return $newStoreStockCard;
    }
}

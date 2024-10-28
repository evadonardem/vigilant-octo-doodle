<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GetDeliveryTripsRequest;
use App\Services\DeliveryService;
use Carbon\Carbon;

class DeliveryTripsController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:Generate delivery trips summary report')->only('index');
    }

    public function index(GetDeliveryTripsRequest $request)
    {
        $attributes = $request->only(['from', 'to']);
        $deliveryService = resolve(DeliveryService::class);
        $allTrips = $deliveryService->getAllTripsByPeriod($attributes['from'], $attributes['to']);
        $allTrips = array_map(function ($staff) {
            $deliveries = $staff['deliveries'];
            $instances = [];
            foreach ($deliveries as $delivery) {
                $instances[] = [
                    'biometric_id' => $staff['biometric_id'],
                    'name' => $staff['name'],
                    'coverage_date' => $delivery->coverage_date,
                    'trips' => $delivery->no_of_deliveries,
                    'references' => $delivery->references,
                ];
            }

            return $instances;
        }, $allTrips);

        $allTrips = collect($allTrips)->flatten(1)
            ->sortBy(function ($item) {
                return Carbon::parse($item['coverage_date']);
            })
            ->values()
            ->sortBy('name')
            ->values();

        return response()->json([
            'data' => $allTrips,
            'meta' => [
                'search_filters' => $attributes,
            ]
        ]);
    }
}

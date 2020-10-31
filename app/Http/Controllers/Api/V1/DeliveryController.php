<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Carbon\Carbon;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        // filtering parameters
        $biometricIds = $request->input('biometric_id')
            ? explode(',', $request->input('biometric_id'))
            : null;
        $name = $request->input('name');
        $startDate = Carbon::createFromFormat('Y-m-d', $request->input('start_date'))
            ->format('Y-m-d');
        $endDate = Carbon::createFromFormat('Y-m-d', $request->input('end_date'))
            ->format('Y-m-d');

        $deliveries = null;
        if ($biometricIds) {
            $deliveries = Delivery::with('user')
                ->whereHas('user', function ($query) use ($biometricIds) {
                    $query->whereIn('biometric_id', $biometricIds);
                })
                ->whereBetween('delivery_date', [$startDate, $endDate])
                ->orderBy('delivery_date', 'asc')
                ->get();
        } else {
            $deliveries = Delivery::with('user')
                ->whereBetween('delivery_date', [$startDate, $endDate])
                ->orderBy('delivery_date', 'asc')
                ->get();
        }

        return response()->json(['data' => $deliveries]);
    }

    public function update(Request $request, $id)
    {
        $delivery = Delivery::findOrFail($id);
        $delivery->no_of_deliveries = $request->input('no_of_deliveries');
        $delivery->remarks = $request->input('remarks');
        $delivery->save();

        return response()->noContent();
    }

    public function destroy(Request $request, $id)
    {
        $delivery = Delivery::findOrFail($id);
        $delivery->delete();

        return response()->noContent();
    }
}

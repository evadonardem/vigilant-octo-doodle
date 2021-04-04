<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderAssignedStaff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PurchaseOrderAssignedStaffController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(PurchaseOrder $purchaseOrder)
    {
        $assignedStaff = $purchaseOrder->assignedStaff()
            ->orderBy('name', 'asc')
            ->get();

        $assignedStaff->each(function ($staff) use ($purchaseOrder) {
            $staff->can_delete = +$purchaseOrder->status->id !== 3;
        });

        return response()->json(['data' => $assignedStaff]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (+$purchaseOrder->status->id === 3) {
            abort(422, 'Cannot assign staff. Purchase order status is ' . $purchaseOrder->status->name);
        }

        $user = User::where('biometric_id', '=', $request->input('biometric_id'))->first();

        if ($purchaseOrder->assignedStaff->contains($user)) {
            return abort(422, 'Staff already assigned to this purchase order.');
        }

        $purchaseOrder->assignedStaff()->attach($user);

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PurchaseOrderAssignedStaff  $purchaseOrderAssignedStaff
     * @return \Illuminate\Http\Response
     */
    public function destroy(PurchaseOrder $purchaseOrder, PurchaseOrderAssignedStaff $purchaseOrderAssignedStaff)
    {
        if (+$purchaseOrder->status->id === 3) {
            abort(422, 'Cannot delete assigned staff. Purchase order status is ' . $purchaseOrder->status->name);
        }

        if ($purchaseOrderAssignedStaff->purchase_order_id == $purchaseOrder->id) {
            $purchaseOrderAssignedStaff->delete();
        }

        return response()->noContent();
    }
}

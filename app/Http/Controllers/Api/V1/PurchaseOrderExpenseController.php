<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderExpense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(PurchaseOrder $purchaseOrder)
    {
        $expenses = $purchaseOrder->expenses()
            ->orderBy('name', 'asc')
            ->get();

        $expenses->each(function ($expense) use ($purchaseOrder) {
            $expense->can_update = $expense->can_delete = +$purchaseOrder->status->id !== 3;
        });

        return response()->json(['data' => $expenses]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexPurchaseOrderExpenseTypes()
    {
        $expenseTypes = PurchaseOrderExpense::select(['name'])
            ->groupBy('name')
            ->get();

        return response()->json(['data' => $expenseTypes]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
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
            abort(422, 'Cannot allocate expense. Purchase order status is ' . $purchaseOrder->status->name);
        }

        $attributes = $request->only(['name', 'amount_original']);
        $purchaseOrder->expenses()->save(PurchaseOrderExpense::make($attributes));

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PurchaseOrderExpense  $purchaseOrderExpense
     * @return \Illuminate\Http\Response
     */
    public function show(PurchaseOrderExpense $purchaseOrderExpense)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PurchaseOrderExpense  $purchaseOrderExpense
     * @return \Illuminate\Http\Response
     */
    public function edit(PurchaseOrderExpense $purchaseOrderExpense)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\PurchaseOrderExpense  $purchaseOrderExpense
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder, PurchaseOrderExpense $purchaseOrderExpense)
    {
        if (+$purchaseOrder->status->id === 3) {
            abort(422, 'Cannot update purchase order allocated expense. Purchase order status is ' . $purchaseOrder->status->name);
        }

        $attributes = $request->only('amount_actual');

        if (+$purchaseOrderExpense->purchase_order_id === +$purchaseOrder->id) {
            $purchaseOrderExpense->fill($attributes)->save();
        }

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PurchaseOrderExpense  $purchaseOrderExpense
     * @return \Illuminate\Http\Response
     */
    public function destroy(PurchaseOrder $purchaseOrder, PurchaseOrderExpense $purchaseOrderExpense)
    {
        if (+$purchaseOrder->status->id === 3) {
            abort(422, 'Cannot delete purchase order allocated expense. Purchase order status is ' . $purchaseOrder->status->name);
        }

        if (+$purchaseOrderExpense->purchase_order_id === +$purchaseOrder->id) {
            $purchaseOrderExpense->delete();
        }

        return response()->noContent();
    }
}

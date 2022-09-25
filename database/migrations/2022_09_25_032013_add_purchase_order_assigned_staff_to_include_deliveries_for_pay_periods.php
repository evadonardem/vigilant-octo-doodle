<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPurchaseOrderAssignedStaffToIncludeDeliveriesForPayPeriods extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('purchase_order_assigned_staff', function (Blueprint $table) {
            $table->addColumn('boolean', 'include_deliveries_for_pay_periods')->after('user_id')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('purchase_order_assigned_staff', function (Blueprint $table) {
            $table->dropColumn('include_deliveries_for_pay_periods');
        });
    }
}

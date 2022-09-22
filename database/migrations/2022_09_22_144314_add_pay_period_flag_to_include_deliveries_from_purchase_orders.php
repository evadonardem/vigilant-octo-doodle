<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPayPeriodFlagToIncludeDeliveriesFromPurchaseOrders extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pay_periods', function (Blueprint $table) {
            $table->addColumn('boolean', 'include_deliveries_from_purchase_orders')->after('to')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pay_periods', function (Blueprint $table) {
            $table->dropColumn('include_deliveries_from_purchase_orders');
        });
    }
}

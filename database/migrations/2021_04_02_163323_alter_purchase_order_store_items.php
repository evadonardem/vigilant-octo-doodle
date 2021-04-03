<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterPurchaseOrderStoreItems extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('purchase_order_store_items', function (Blueprint $table) {
            $table->string('remarks')->after('quantity_returns')->default('');
            $table->string('booklet_no')->after('quantity_returns')->default('');
            $table->string('delivery_receipt_no')->after('quantity_returns')->default('');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('purchase_order_store_items', function (Blueprint $table) {
            $table->dropColumn('remarks');
            $table->dropColumn('booklet_no');
            $table->dropColumn('delivery_receipt_no');
        });
    }
}

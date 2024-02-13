<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateDeliveryReceiptPaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('delivery_receipt_payments', function (Blueprint $table) {
            if (Schema::hasColumn('delivery_receipt_payments', 'purchase_order_store_item_id')) {
                $table->dropConstrainedForeignId('purchase_order_store_item_id');
            }
            $table->foreignId('store_id')->after('id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('delivery_receipt_no')->index()->after('store_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (! Schema::hasColumn('delivery_receipt_payments', 'purchase_order_store_item_id')) {
            Schema::table('delivery_receipt_payments', function (Blueprint $table) {
                $table->foreignId('purchase_order_store_item_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            });
        }

        if (Schema::hasColumn('delivery_receipt_payments', 'store_id')) {
            Schema::table('delivery_receipt_payments', function (Blueprint $table) {
                $table->dropConstrainedForeignId('store_id');
            });
        }

        if (Schema::hasColumn('delivery_receipt_payments', 'delivery_receipt_no')) {
            Schema::table('delivery_receipt_payments', function (Blueprint $table) {
                $table->dropColumn('delivery_receipt_no');
            });
        }
    }
}

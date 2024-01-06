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
            $table->dropConstrainedForeignId('purchase_order_store_item_id');
            $table->string('delivery_receipt_no')->after('payment_date');
            $table->index('delivery_receipt_no');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (!Schema::hasColumn('delivery_receipt_payments', 'purchase_order_store_item_id')) {
            Schema::table('delivery_receipt_payments', function (Blueprint $table) {
                $table->foreignId('purchase_order_store_item_id')
                    ->constrained()
                    ->cascadeOnUpdate()
                    ->cascadeOnDelete();
            });
        }

        if (Schema::hasColumn('delivery_receipt_payments', 'delivery_receipt_no')) {
            Schema::table('delivery_receipt_payments', function (Blueprint $table) {
                $table->dropColumn('delivery_receipt_no');
            });
        }
    }
}

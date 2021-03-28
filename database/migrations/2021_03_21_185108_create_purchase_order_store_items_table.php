<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePurchaseOrderStoreItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('purchase_order_store_items', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('purchase_order_id')->unsigned();
            $table->bigInteger('store_id')->unsigned();
            $table->bigInteger('item_id')->unsigned();
            $table->integer('quantity_original')->unsigned();
            $table->integer('quantity_actual')->unsigned()->nullable();
            $table->integer('quantity_bad_orders')->unsigned()->nullable();
            $table->integer('quantity_returns')->unsigned()->nullable();
            $table
                ->foreign('purchase_order_id')
                ->references('id')
                ->on('purchase_orders')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table
                ->foreign('store_id')
                ->references('id')
                ->on('stores')
                ->onDelete('restrict')
                ->onUpdate('restrict');
            $table
                ->foreign('item_id')
                ->references('id')
                ->on('items')
                ->onDelete('restrict')
                ->onUpdate('restrict');
            $table->unique(
                ['purchase_order_id', 'store_id', 'item_id'],
                'purchase_order_store_item_unique'
            );
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('purchase_order_store_items');
    }
}

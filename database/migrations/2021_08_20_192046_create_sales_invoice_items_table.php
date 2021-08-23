<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSalesInvoiceItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sales_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('sales_invoice_id')->unsigned();
            $table->bigInteger('store_id')->unsigned();
            $table->bigInteger('item_id')->unsigned();
            $table->integer('quantity')->unsigned();
            $table->timestamps();
            $table
                ->foreign('sales_invoice_id')
                ->references('id')
                ->on('sales_invoices')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table
                ->foreign('store_id')
                ->references('id')
                ->on('stores')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table
                ->foreign('item_id')
                ->references('id')
                ->on('items')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sales_invoice_items');
    }
}

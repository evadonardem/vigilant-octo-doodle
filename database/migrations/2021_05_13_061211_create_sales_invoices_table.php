<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSalesInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sales_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('booklet_no');
            $table->string('invoice_no');
            $table->bigInteger('store_id')->unsigned();
            $table->date('date_countered');
            $table->date('from');
            $table->date('to');
            $table->unsignedDecimal('total_sales');
            $table->unsignedDecimal('vat_rate', 8, 6);
            $table->timestamps();
            $table
                ->foreign('store_id')
                ->references('id')
                ->on('stores')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table->unique(['booklet_no', 'invoice_no']);
            $table->index(['booklet_no']);
            $table->index(['invoice_no']);
            $table->index(['date_countered']);
            $table->index(['from']);
            $table->index(['to']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sales_invoices');
    }
}

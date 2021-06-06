<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterSalesInvoicesTableChangeReferenceFromStoreToCategory extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn(['store_id']);
            $table
                ->unsignedBigInteger('category_id')
                ->after('invoice_no');
            $table
                ->foreign('category_id')
                ->references('id')
                ->on('categories')
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
        Schema::table('sales_invoices', function (Blueprint $table) {
            $table
                ->unsignedBigInteger('store_id')
                ->after('invoice_no');
            $table
                ->foreign('store_id')
                ->references('id')
                ->on('stores')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table->dropForeign(['category_id']);
            $table->dropColumn(['category_id']);
        });
    }
}

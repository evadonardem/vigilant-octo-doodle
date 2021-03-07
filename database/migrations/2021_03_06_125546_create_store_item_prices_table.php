<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoreItemPricesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('store_item_prices', function (Blueprint $table) {
            $table->id();
            $table->date('effectivity_date');
            $table->bigInteger('store_id')->unsigned();
            $table->bigInteger('item_id')->unsigned();
            $table->decimal('amount', 8, 2, true);
            $table->unique(['effectivity_date', 'store_id', 'item_id']);
            $table->foreign('store_id')
                ->references('id')
                ->on('stores')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->foreign('item_id')
                ->references('id')
                ->on('items')
                ->onDelete('cascade')
                ->onUpdate('cascade');
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
        Schema::dropIfExists('store_item_prices');
    }
}

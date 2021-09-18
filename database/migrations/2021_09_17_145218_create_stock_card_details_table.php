<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStockCardDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stock_card_details', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('stock_card_id')->unsigned();
            $table->string('type');
            $table->bigInteger('item_id')->unsigned();
            $table->integer('quantity')->unsigned();
            $table->timestamps();
            $table->index('type');
            $table
                ->foreign('stock_card_id')
                ->references('id')
                ->on('stock_cards')
                ->onDelete('cascade')
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
        Schema::dropIfExists('stock_card_details');
    }
}

<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDeliveriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->date('delivery_date');
            $table->unsignedInteger('no_of_deliveries');
            $table->text('remarks');
            $table->timestamps();

            $table->foreign('user_id')
              ->references('id')
              ->on('users')
              ->onDelete('cascade')
              ->onUpdate('cascade');
           $table->unique([
                'user_id',
                'delivery_date',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('deliveries');
    }
}

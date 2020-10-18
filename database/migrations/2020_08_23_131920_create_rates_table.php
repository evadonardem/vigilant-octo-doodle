<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rates', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->date('effectivity_date');
            $table->unsignedBigInteger('rate_type_id');
            $table->decimal('amount', 8, 2);
            $table->timestamps();
            $table->foreign('user_id')
              ->references('id')
              ->on('users')
              ->onDelete('cascade')
              ->onUpdate('cascade');
            $table->foreign('rate_type_id')
              ->references('id')
              ->on('rate_types')
              ->onDelete('cascade')
              ->onUpdate('cascade');
            $table->unique([
                'user_id',
                'effectivity_date',
                'rate_type_id',
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
        Schema::dropIfExists('rates');
    }
}

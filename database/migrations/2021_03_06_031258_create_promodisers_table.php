<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePromodisersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('promodisers', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('store_id')->unsigned();
            $table->string('name')->index();
            $table->timestamps();
            $table->foreign('store_id')
                ->references('id')
                ->on('stores')
                ->onDelete('cascade')
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
        Schema::dropIfExists('promodisers');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJobContractsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('job_contracts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('promodiser_id');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamps();
            $table
                ->foreign('promodiser_id')
            	   ->references('id')
            	   ->on('promodisers')
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
        Schema::dropIfExists('job_contracts');
    }
}

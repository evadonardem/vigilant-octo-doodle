<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOvertimeRatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('overtime_rates', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('overtime_rate_type_id');
            $table->date('effectivity_date');
            $table->decimal('non_night_shift', 5, 3);
            $table->decimal('night_shift', 5, 3);
            $table->timestamps();
            $table->foreign('overtime_rate_type_id')
              ->references('id')
              ->on('overtime_rate_types')
              ->onDelete('restrict')
              ->onUpdate('cascade');
            $table->unique([
                'overtime_rate_type_id',
                'effectivity_date',
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
        Schema::dropIfExists('overtime_rates');
    }
}

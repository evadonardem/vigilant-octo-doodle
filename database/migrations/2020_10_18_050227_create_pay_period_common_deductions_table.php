<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePayPeriodCommonDeductionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pay_period_common_deductions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('pay_period_id');
            $table->unsignedBigInteger('deduction_type_id');
            $table->decimal('default_amount', 8, 2)->nullable();
            $table->timestamps();
            $table->foreign('pay_period_id')
              ->references('id')
              ->on('pay_periods')
              ->onDelete('cascade')
              ->onUpdate('cascade');
            $table->foreign('deduction_type_id')
              ->references('id')
              ->on('deduction_types')
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
        Schema::dropIfExists('pay_period_common_deductions');
    }
}

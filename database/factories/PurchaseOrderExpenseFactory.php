<?php

namespace Database\Factories;

use App\Models\PurchaseOrderExpense;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseOrderExpenseFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PurchaseOrderExpense::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->unique()->numerify('EXP-####'),
            'amount_original' => $this->faker->randomFloat(2, 0, 999),
        ];
    }
}

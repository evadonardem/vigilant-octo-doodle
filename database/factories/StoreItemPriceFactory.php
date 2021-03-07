<?php

namespace Database\Factories;

use App\Models\StoreItemPrice;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoreItemPriceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = StoreItemPrice::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'effectivity_date' => $this->faker->date('Y-m-d'),
            'amount' => $this->faker->randomFloat(2, 0, 999999),
        ];
    }
}

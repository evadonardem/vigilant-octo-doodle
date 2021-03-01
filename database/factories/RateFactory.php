<?php

namespace Database\Factories;

use App\Models\Rate;
use App\Models\RateType;
use Illuminate\Database\Eloquent\Factories\Factory;

class RateFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Rate::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'effectivity_date' => $this->faker->date('Y-m-d'),
            'rate_type_id' => RateType::findOrFail(1)->id,
            'amount' => $this->faker->randomFloat(2, 0, 999),
        ];
    }
}

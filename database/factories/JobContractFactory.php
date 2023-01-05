<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class JobContractFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'rate' => random_int(350, 700),
        ];
    }
}

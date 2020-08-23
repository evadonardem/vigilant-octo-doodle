<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\Rate;
use Faker\Generator as Faker;

$factory->define(Rate::class, function (Faker $faker) {
    return [
        'amount' => $faker->randomFloat(2, 0, 999),
    ];
});

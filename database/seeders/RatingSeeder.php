<?php

namespace Database\Seeders;

use App\Models\Rating;
use Illuminate\Database\Seeder;

class RatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $ratings = [
            [
                'title' => 'Excellent',
                'score' => 3,
            ],
            [
                'title' => 'Good',
                'score' => 2,
            ],
            [
                'title' => 'Poor',
                'score' => 1,
            ],
        ];
        foreach ($ratings as $rating) {
            Rating::create($rating);
        }
    }
}

<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseOrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PurchaseOrder::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $from = $this->faker->date('Y-m-d');
        $to = Carbon::createFromFormat('Y-m-d', $from)
            ->addDays(random_int(1, 10))
            ->format('Y-m-d');
        return [
            'code' => $this->faker->unique()->numerify('PO-#####'),
            'location' => $this->faker->city(),
            'from' => $from,
            'to' => $to,
            'purchase_order_status_id' => PurchaseOrderStatus::where('code', 'pending')->first()->id,
        ];
    }
}

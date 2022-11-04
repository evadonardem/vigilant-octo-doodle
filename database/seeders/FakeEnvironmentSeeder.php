<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\JobContract;
use App\Models\Location;
use App\Models\Promodiser;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderAssignedStaff;
use App\Models\PurchaseOrderExpense;
use App\Models\PurchaseOrderStoreItem;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use App\Models\Store;
use App\Models\StoreItemPrice;
use App\Models\User;
use Carbon\Carbon;
use DB;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class FakeEnvironmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
		// clear instances
		DB::transaction(function () {
			$tables = [
				(new SalesInvoice)->getTable(),
				(new PurchaseOrder)->getTable(),
				(new PurchaseOrderExpense)->getTable(),
                (new JobContract())->getTable(),
				(new Store)->getTable(),
                (new Promodiser)->getTable(),
				(new Item)->getTable(),
				(new Category)->getTable(),
				(new Location)->getTable(),
			];
			foreach ($tables as $table) {
				DB::table($table)->delete();
			}
		});

		// create fake items
		$items = Item::factory(10)->create();

		// create fake categories
		$categories = Category::factory(10)->create();

		// create fake locations
		$locations = Location::factory(5)->create();

		// create fake stores
        $stores = Store::factory()
			->count(10)
			->state(new Sequence(
				fn () => ['category_id' => $categories->random()->id, 'location_id' => $locations->random()->id],
			))
            ->has(Promodiser::factory()->count(10))
			->create();
        $stores->each(function ($store) {
            $store->promodisers->each(function ($promodiser) {
                JobContract::factory()->create([
                    'promodiser_id' => $promodiser->id,
                    'start_date' => Carbon::now()->subMonths(random_int(1, 6)),
                    'end_date' => null,
                ]);
            });
        });

		// create fake store items
        $stores->each(fn($store) => (
            $items->random(10)->each(fn($item) => (
                StoreItemPrice::factory()
                ->count(5)
                ->create([
                    'store_id' => $store->id,
                    'item_id' => $item->id,
                ])
            ))
        ));

		// create fake purchase orders
        $purchaseOrders = PurchaseOrder::factory(100)->create();
        $purchaseOrders->each(function ($purchaseOrder) use ($stores) {
			$startDate = Carbon::now()->addDays(random_int(1, 90));
			$purchaseOrder->from = $startDate->format('Y-m-d');
			$purchaseOrder->to = $startDate->addDays(random_int(1, 2))->format('Y-m-d');
			$purchaseOrder->save();
			foreach ($stores->random(3) as $store) {
				PurchaseOrderStoreItem::create([
					'purchase_order_id' => $purchaseOrder->id,
					'store_id' => $store->id,
					'item_id' => $store->items->unique('id')->first()->id,
					'quantity_original' => random_int(1, 100),
				]);
				PurchaseOrderStoreItem::create([
					'purchase_order_id' => $purchaseOrder->id,
					'store_id' => $store->id,
					'item_id' => $store->items->unique('id')->last()->id,
					'quantity_original' => random_int(1, 100),
				]);
			}
		});

        // set purchase orders status approved
        $purchaseOrders->where('purchase_order_status_id', 1)->random(50)->each(function ($purchaseOrder) {
			PurchaseOrderAssignedStaff::factory()->create([
				'purchase_order_id' => $purchaseOrder->id,
				'user_id' => User::all()->random()->id,
			]);
			$purchaseOrder->expenses()->saveMany(PurchaseOrderExpense::factory()->count(random_int(1, 5))->make());
			$purchaseOrder->purchase_order_status_id = 2;
			$purchaseOrder->save();
		});

		// set purchase orders status closed
		$purchaseOrders->where('purchase_order_status_id', 2)->random(25)->each(function ($purchaseOrder, $index1) {
			$purchaseOrder->items->each(function ($item, $index2) use ($index1) {
				$item->pivot->quantity_actual = $item->pivot->quantity_original;
				$item->pivot->booklet_no = $index1 + 1;
				$item->pivot->delivery_receipt_no = $item->pivot->booklet_no + ($index2 + 1);
				$item->pivot->save();
			});
			$purchaseOrder->purchase_order_status_id = 3;
			$purchaseOrder->save();
		});

		// create fake sales invoices
		for ($countBooklets = 4, $i = 0, $perBooklet = 25, $vatRate = 0.10715; $i < $countBooklets; $i++) {
			$salesInvoices = SalesInvoice::factory()
			->count($perBooklet)
			->state(new Sequence(
				function ($sequence) use ($categories, $i, $perBooklet, $vatRate) {
					$startDate = Carbon::now()->addDays(random_int(1, 90));
					$from = $startDate->format('Y-m-d');
					$to = $startDate->addDays(random_int(1, 2))->format('Y-m-d');
					return [
						'booklet_no' => $i + 1,
						'category_id' => $categories->random()->id,
						'date_countered' => $to,
						'from' => $from,
						'invoice_no' => ($i * $perBooklet) + $sequence->index + 1,
						'to' => $to,
						'vat_rate' => $vatRate,
					];
				}
			))
			->create()
			->each(function ($salesInvoice) use ($stores) {
				foreach ($stores->random(3) as $store) {
					SalesInvoiceItem::create([
						'sales_invoice_id' => $salesInvoice->id,
						'store_id' => $store->id,
						'item_id' => $store->items->unique('id')->first()->id,
						'quantity' => random_int(1, 100),
					]);
					SalesInvoiceItem::create([
						'sales_invoice_id' => $salesInvoice->id,
						'store_id' => $store->id,
						'item_id' => $store->items->unique('id')->last()->id,
						'quantity' => random_int(1, 100),
					]);
				}
			});
		}
    }
}

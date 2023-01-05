<?php

namespace Tests\Feature\Http\Controllers\Api\V1;

use App\Models\Category;
use App\Models\Location;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class StoreControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $users = null;
    private $authToken = null;
    private $categories = null;
    private $locations = null;
    private $stores = null;

    public function setUp(): void
    {
        parent::setUp();
        $this->users = User::factory()->count(100)->create();
        $this->authToken = $this->authenticate($this->users->random());
        $this->categories = Category::factory()->count(10)->create();
        $this->locations = Location::factory()->count(10)->create();
        $this->stores = Store::factory()->count(100)
            ->state(new Sequence(fn () => ['category_id' => $this->categories->random()->id, 'location_id' => $this->locations->random()->id]))
            ->create();
    }

    /**
     * Test list stores.
     *
     * @return void
     */
    public function testListStores()
    {
        $response = $this->get('api/settings/stores?token=' . $this->authToken);
        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data',
            ]);
        $this->assertNotEmpty($response->json('data'));
    }

    /**
     * Test list all stores.
     *
     * @return void
     */
    public function testListAllStores()
    {
        $response = $this->get('api/settings/stores?all=1&token=' . $this->authToken);
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);
        $this->assertNotEmpty($response->json('data'));
    }

    /**
     * Test list stores.
     *
     * @return void
     */
    public function testListStoresWithSearchValue()
    {
        $response = $this->get('api/settings/stores?search[value]=' . $this->stores->random()->name . '&token=' . $this->authToken);
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data',
            ]);
        $this->assertNotEmpty($response->json('data'));
    }

    /**
     * Test list stores filter by category.
     *
     * @return void
     */
    public function testListStoresFilterByCategory()
    {
        $response = $this->get('api/settings/stores?category_id=' . $this->stores->random()->category_id . '&token=' . $this->authToken);
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data',
            ]);
        $this->assertNotEmpty($response->json('data'));
    }

    /**
     * Test list stores with no category.
     *
     * @return void
     */
    public function testListStoresWithNoCategory()
    {
        $storeNoCategory = $this->stores->random();
        $storeNoCategory->category_id = null;
        $storeNoCategory->save();

        $response = $this->get('api/settings/stores?category_id=0&token=' . $this->authToken);
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data',
            ]);
        $this->assertNotEmpty($response->json('data'));
    }

    /**
     * Test add new store w/ existing category and location.
     *
     * @return void
     */
    public function testAddNewStoreWithExistingCategoryAndLocation()
    {
        $store = Store::factory()->make();
        $category = Category::factory()->create();
        $location = Location::factory()->create();
        $response = $this->post(
            'api/settings/stores?token=' . $this->authToken,
            [
                'code' => $store->code,
                'name' => $store->name,
                'category' => [
                    'value' => $category->id,
                ],
                'location' => [
                    'value' => $location->id,
                ],
                'address_line' => $store->address_line,
            ]
        );
        $response->assertStatus(204);
    }

    /**
     * Test add new store w/ new category and location.
     *
     * @return void
     */
    public function testAddNewStoreWithNewCategoryAndLocation()
    {
        $store = Store::factory()->make();
        $category = Category::factory()->make();
        $location = Location::factory()->make();
        $response = $this->post(
            'api/settings/stores?token=' . $this->authToken,
            [
                'code' => $store->code,
                'name' => $store->name,
                'category' => [
                    '__isNew__' => true,
                    'label' => $category->name,
                ],
                'location' => [
                    '__isNew__' => true,
                    'label' => $location->name,
                ],
                'address_line' => $store->address_line,
            ]
        );
        $response->assertStatus(204);
    }

    /**
     * Test add new store missing required fields.
     *
     * @return void
     */
    public function testAddNewStoreMissingRequiredFields()
    {
        $store = Store::factory()->make();
        $response = $this->post(
            'api/settings/stores?token=' . $this->authToken,
            [
                'code' => $store->code,
                'name' => $store->name,
            ]
        );
        $response->assertStatus(422);
    }

    /**
     * Test show store details.
     *
     * @return void
     */
    public function testShowStoreDetails()
    {
        $store = $this->stores->random();
        $response = $this->get('api/settings/stores/' .
            $store->id . '?token=' . $this->authToken);
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);
        $this->assertNotEmpty($response->json('data'));
    }

    /**
     * Test delete store.
     *
     * @return void
     */
    public function testDeleteStore()
    {
        $storeToDelete = $this->stores->random();
        $response = $this->delete('api/settings/stores/' .
            $storeToDelete->id . '?token=' . $this->authToken);
        $response->assertStatus(204);
    }
}

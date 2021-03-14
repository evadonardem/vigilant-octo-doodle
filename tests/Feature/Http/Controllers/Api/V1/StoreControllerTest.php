<?php

namespace Tests\Feature\Http\Controllers\Api\V1;

use App\Models\Store;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class StoreControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $users = null;
    private $authToken = null;
    private $stores = null;

    public function setUp(): void
    {
        parent::setUp();
        $this->users = User::factory()->count(100)->create();
        $this->authToken = $this->authenticate($this->users->random());
        $this->stores = Store::factory()->count(100)->create();
    }

    /**
     * Test list stores.
     *
     * @return void
     */
    public function testListStores()
    {
        $response = $this->get('api/settings/stores?token=' . $this->authToken);
        $response->assertStatus(200);
    }

    /**
     * Test add new store.
     *
     * @return void
     */
    public function testAddNewStore()
    {
        $store = Store::factory()->make();
        $response = $this->post(
            'api/settings/stores?token=' . $this->authToken,
            [
                'code' => $store->code,
                'name' => $store->name,
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

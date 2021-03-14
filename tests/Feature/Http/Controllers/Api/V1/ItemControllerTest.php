<?php

namespace Tests\Feature\Http\Controllers\Api\V1;

use App\Models\Item;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ItemControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $users = null;
    private $authToken = null;
    private $items = null;

    public function setUp(): void
    {
        parent::setUp();
        $this->users = User::factory()->count(100)->create();
        $this->authToken = $this->authenticate($this->users->random());
        $this->items = Item::factory()->count(100)->create();
    }

    /**
     * Test list items.
     *
     * @return void
     */
    public function testListItems()
    {
        $response = $this->get('api/settings/items?token=' . $this->authToken);
        $response->assertStatus(200);
    }

    /**
     * Test add new item.
     *
     * @return void
     */
    public function testAddNewItem()
    {
        $item = Item::factory()->make();
        $response = $this->post(
            'api/settings/items?token=' . $this->authToken,
            [
                'code' => $item->code,
                'name' => $item->name,
            ]
        );
        $response->assertStatus(204);
    }

    /**
     * Test add new item missing required fields.
     *
     * @return void
     */
    public function testAddNewItemMissingRequiredFields()
    {
        $item = Item::factory()->make();
        $response = $this->post(
            'api/settings/items?token=' . $this->authToken,
            [
                'code' => $item->code,
            ]
        );
        $response->assertStatus(422);
    }

    /**
     * Test delete item.
     *
     * @return void
     */
    public function testDeleteItem()
    {
        $itemToDelete = $this->items->random();
        $response = $this->delete('api/settings/items/' .
            $itemToDelete->id . '?token=' . $this->authToken);
        $response->assertStatus(204);
    }
}

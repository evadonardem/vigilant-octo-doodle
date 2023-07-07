<?php

use App\Http\Controllers\Api\V2\ConsumableItemController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => 'Warehouse API');

Route::group(
    [
        'prefix' => 'consumable-items',
        'middleware' => [
            'api.auth',
            'bindings',
        ],
    ],
    function () {
        Route::get('/', [
            ConsumableItemController::class,
            'index',
        ]);
        Route::post('/', [
            ConsumableItemController::class,
            'store',
        ]);
        Route::get('/{consumableItem}', [
            ConsumableItemController::class,
            'show',
        ]);
        Route::delete('/{consumableItem}', [
            ConsumableItemController::class,
            'destroy',
        ]);
    }
);

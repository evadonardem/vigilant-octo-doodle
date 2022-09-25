<?php


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

$api = app('Dingo\Api\Routing\Router');

$api->version('v1', function ($api) {
    $api->get('/', function () {
        return 'TAD API';
    });

    $api->post('login', 'App\Http\Controllers\Api\V1\AuthController@login');

    $api->group(['prefix' => 'navigation-menu', 'middleware' => 'api.auth'], function ($api) {
        $api->get('/', 'App\Http\Controllers\Api\V1\NavigationMenuController@index');
    });

    $api->group(['middleware' => 'api.auth'], function ($api) {
        $api->post('logout', 'App\Http\Controllers\Api\V1\AuthController@logout');
        $api->post('refresh', 'App\Http\Controllers\Api\V1\AuthController@refresh');
        $api->post('me', 'App\Http\Controllers\Api\V1\AuthController@me');
    });

    $api->group(['middleware' => ['api.auth', 'bindings']], function ($api) {
        $api->post('manual-logs', 'App\Http\Controllers\Api\V1\ManualLogController@store');
        $api->resource('deliveries', 'App\Http\Controllers\Api\V1\DeliveryController');
        $api->get('daily-time-record', 'App\Http\Controllers\Api\V1\DailyTimeRecordController@index');
        $api->get('pay-periods', 'App\Http\Controllers\Api\V1\PayPeriodController@index');
        $api->post('pay-periods', 'App\Http\Controllers\Api\V1\PayPeriodController@store');
        $api->get('pay-periods/{payPeriodId}', 'App\Http\Controllers\Api\V1\PayPeriodController@show');
        $api->get('pay-periods/{payPeriodId}/details', 'App\Http\Controllers\Api\V1\PayPeriodController@showPayPeriodDetails');
        $api->delete('pay-periods/{payPeriodId}', 'App\Http\Controllers\Api\V1\PayPeriodController@destroy');
        $api->post('pay-periods/{payPeriodId}/common-deductions', 'App\Http\Controllers\Api\V1\PayPeriodController@storeCommonDeductions');
        $api->post('update-user-pay-period-deductions', 'App\Http\Controllers\Api\V1\PayPeriodController@updateUserPayPeriodDeductions');

        $api->get('thirteenth-month-pay-periods', 'App\Http\Controllers\Api\V1\ThirteenthMonthController@index');
        $api->post('thirteenth-month-pay-periods', 'App\Http\Controllers\Api\V1\ThirteenthMonthController@store');
        $api->get('thirteenth-month-pay-periods/{id}', 'App\Http\Controllers\Api\V1\ThirteenthMonthController@show');
        $api->delete('thirteenth-month-pay-periods/{id}', 'App\Http\Controllers\Api\V1\ThirteenthMonthController@destroy');
        $api->get('thirteenth-month-pay-periods/{id}/details', 'App\Http\Controllers\Api\V1\ThirteenthMonthController@showThirteenthMonthPayPeriodDetails');

        $api->resource('purchase-orders', 'App\Http\Controllers\Api\V1\PurchaseOrderController');
        $api->get('purchase-orders-folders', 'App\Http\Controllers\Api\V1\PurchaseOrderController@indexPurchaseOrderFolders');
        $api->get('purchase-order-locations', 'App\Http\Controllers\Api\V1\PurchaseOrderController@indexPurchaseOrderLocations');
        $api->get('purchase-orders/{purchaseOrder}/stores', 'App\Http\Controllers\Api\V1\PurchaseOrderController@indexPurchaseOrderStores');
        $api->delete('purchase-orders/{purchaseOrder}/stores/{store}', 'App\Http\Controllers\Api\V1\PurchaseOrderController@destroyPurchaseOrderStore');
        $api->post('purchase-orders/{purchaseOrder}/stores-sort-order', 'App\Http\Controllers\Api\V1\PurchaseOrderController@syncPurchaseOrderStoresSortOrder');
        $api->post('purchase-orders/{purchaseOrder}/items', 'App\Http\Controllers\Api\V1\PurchaseOrderController@storePurchaseOrderItems');
        $api->resource('purchase-orders/{purchaseOrder}/stores/{store}/items', 'App\Http\Controllers\Api\V1\PurchaseOrderStoreItemController');
        $api->get('purchase-orders/{purchaseOrder}/stores/{store}/requests', 'App\Http\Controllers\Api\V1\PurchaseOrderStoreItemController@indexStoreRequests');

        $api->get('purchase-orders/{purchaseOrder}/assigned-staff', 'App\Http\Controllers\Api\V1\PurchaseOrderAssignedStaffController@index');
        $api->post('purchase-orders/{purchaseOrder}/assigned-staff', 'App\Http\Controllers\Api\V1\PurchaseOrderAssignedStaffController@store');
        $api->patch('purchase-orders/{purchaseOrder}/assigned-staff/{purchaseOrderAssignedStaff}', 'App\Http\Controllers\Api\V1\PurchaseOrderAssignedStaffController@update');
        $api->delete('purchase-orders/{purchaseOrder}/assigned-staff/{purchaseOrderAssignedStaff}', 'App\Http\Controllers\Api\V1\PurchaseOrderAssignedStaffController@destroy');

        $api->get('purchase-order-expense-types', 'App\Http\Controllers\Api\V1\PurchaseOrderExpenseController@indexPurchaseOrderExpenseTypes');
        $api->get('purchase-orders/{purchaseOrder}/expenses', 'App\Http\Controllers\Api\V1\PurchaseOrderExpenseController@index');
        $api->post('purchase-orders/{purchaseOrder}/expenses', 'App\Http\Controllers\Api\V1\PurchaseOrderExpenseController@store');
        $api->patch('purchase-orders/{purchaseOrder}/expenses/{purchaseOrderExpense}', 'App\Http\Controllers\Api\V1\PurchaseOrderExpenseController@update');
        $api->delete('purchase-orders/{purchaseOrder}/expenses/{purchaseOrderExpense}', 'App\Http\Controllers\Api\V1\PurchaseOrderExpenseController@destroy');

        $api->get('sales-invoices', 'App\Http\Controllers\Api\V1\SalesInvoiceController@index');
        $api->get('sales-invoices/{salesInvoice}', 'App\Http\Controllers\Api\V1\SalesInvoiceController@show');
        $api->post('sales-invoices', 'App\Http\Controllers\Api\V1\SalesInvoiceController@store');
        $api->delete('sales-invoices/{salesInvoice}', 'App\Http\Controllers\Api\V1\SalesInvoiceController@destroy');

        $api->get('sales-invoices/{salesInvoice}/items', 'App\Http\Controllers\Api\V1\SalesInvoiceItemController@index');
        $api->post('sales-invoices/{salesInvoice}/items', 'App\Http\Controllers\Api\V1\SalesInvoiceItemController@store');
        $api->delete('sales-invoices/{salesInvoice}/items/{salesInvoiceItem}', 'App\Http\Controllers\Api\V1\SalesInvoiceItemController@destroy');
        $api->get('sales-invoices/{salesInvoice}/stores/{store}/items', 'App\Http\Controllers\Api\V1\SalesInvoiceItemController@indexStoreItems');

        $api->get(
            'charts/sales-by-store-data',
            'App\Http\Controllers\Api\V1\ChartDataController@salesByStore'
        );
        $api->get(
            'charts/sales-by-category-data',
            'App\Http\Controllers\Api\V1\ChartDataController@salesByCategory'
        );
        $api->get(
            'charts/sales-by-location-data',
            'App\Http\Controllers\Api\V1\ChartDataController@salesByLocation'
        );

        $api->get(
            'charts/purchase-orders/{type}',
            'App\Http\Controllers\Api\V1\ChartDataController@purchaseOrders'
        );

        $api->get(
            'charts/item-sales',
            'App\Http\Controllers\Api\V1\ChartDataController@itemSales'
        );
    });

    $api->group(['prefix' => 'biometric', 'middleware' => 'api.auth'], function ($api) {
        $api->get('info', 'App\Http\Controllers\Api\V1\BiometricInfoController@index');
        $api->resource('users', 'App\Http\Controllers\Api\V1\BiometricUsersController');
        $api->get('users/{userId}/rates', 'App\Http\Controllers\Api\V1\RateController@index');
        $api->post('users/{userId}/rates', 'App\Http\Controllers\Api\V1\RateController@store');
        $api->get('attendance-logs', 'App\Http\Controllers\Api\V1\BiometricAttendanceController@index');
    });

    $api->group(['prefix' => 'settings', 'middleware' =>['api.auth', 'bindings']], function ($api) {
        $api->resource('roles', 'App\Http\Controllers\Api\V1\RolesController');
        $api->resource('deduction-types', 'App\Http\Controllers\Api\V1\DeductionTypesController');
        $api->resource('overtime-rates', 'App\Http\Controllers\Api\V1\OvertimeRateController');
        $api->get('overtime-rate-types', 'App\Http\Controllers\Api\V1\OvertimeRateTypeController@index');
        $api->resource('items', 'App\Http\Controllers\Api\V1\ItemController');
        $api->resource('stores', 'App\Http\Controllers\Api\V1\StoreController');
        $api->get('store-categories', 'App\Http\Controllers\Api\V1\StoreController@indexStoreCategories');
        $api->get('store-locations', 'App\Http\Controllers\Api\V1\StoreController@indexStoreLocations');
        $api->resource('stores/{store}/promodisers', 'App\Http\Controllers\Api\V1\StorePromodiserController');
        $api->resource('stores/{store}/promodisers/{promodiser}/job-contracts', 'App\Http\Controllers\Api\V1\StorePromodiserJobContractController');
        $api->resource('stores/{store}/items', 'App\Http\Controllers\Api\V1\StoreItemController');
        $api->get('stores/{store}/item-pricing/{effectivityDate}', 'App\Http\Controllers\Api\V1\StoreItemController@itemPricing');
    });

    $api->group(['prefix' => 'reports', 'middleware' =>['api.auth', 'bindings']], function ($api) {
        $api->get('delivery-sales-monitoring', 'App\Http\Controllers\Api\V1\DeliverySalesMonitoringController@index');
        $api->get('delivery-receipt-monitoring', 'App\Http\Controllers\Api\V1\DeliveryReceiptMonitoringController@index');
        $api->get('sales-invoices-monitoring', 'App\Http\Controllers\Api\V1\SalesInvoiceMonitoringController@index');
        $api->get('stock-cards-monitoring', 'App\Http\Controllers\Api\V1\StockCardsMonitoringController@index');
        $api->get('stock-cards-monitoring-available-items', 'App\Http\Controllers\Api\V1\StockCardsMonitoringController@availableItems');
        $api->get('promodisers-summary', 'App\Http\Controllers\Api\V1\PromodisersSummaryController@index');
        $api->get('item-sales-monitoring', 'App\Http\Controllers\Api\V1\ItemSalesMonitoringController@index');
    });

    $api->group(['prefix' => 'stock-cards', 'middleware' => ['api.auth', 'bindings']], function ($api) {
        $api->get('/', 'App\Http\Controllers\Api\V1\StockCardController@index');
        $api->post('/', 'App\Http\Controllers\Api\V1\StockCardController@store');
        $api->get('/{stockCard}', 'App\Http\Controllers\Api\V1\StockCardController@show');
        $api->delete('/{stockCard}', 'App\Http\Controllers\Api\V1\StockCardController@destroy');
        $api->group(['prefix' => '/{stockCard}/details', 'middleware' => ['bindings']], function ($api) {
            $api->get('/', 'App\Http\Controllers\Api\V1\StockCardDetailController@index');
            $api->post('/', 'App\Http\Controllers\Api\V1\StockCardDetailController@store');
        });
    });

    // Utilities
    $api->get('sync-admin-users', 'App\Http\Controllers\Api\V1\BiometricUsersController@syncAdminUsers');
    $api->get('sync-all-users', 'App\Http\Controllers\Api\V1\BiometricUsersController@syncAllUsers');
    $api->get('device-users', 'App\Http\Controllers\Api\V1\BiometricUsersController@deviceUsers');
});

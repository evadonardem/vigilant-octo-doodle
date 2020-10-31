<?php

use Illuminate\Http\Request;

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

    $api->group(['middleware' => 'api.auth'], function ($api) {
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
    });

    $api->group(['prefix' => 'biometric', 'middleware' => 'api.auth'], function ($api) {
        $api->get('info', 'App\Http\Controllers\Api\V1\BiometricInfoController@index');
        $api->resource('users', 'App\Http\Controllers\Api\V1\BiometricUsersController');
        $api->get('users/{userId}/rates', 'App\Http\Controllers\Api\V1\RateController@index');
        $api->post('users/{userId}/rates', 'App\Http\Controllers\Api\V1\RateController@store');
        $api->get('attendance-logs', 'App\Http\Controllers\Api\V1\BiometricAttendanceController@index');
    });

    $api->group(['prefix' => 'settings', 'middleware' => 'api.auth'], function ($api) {
        $api->resource('roles', 'App\Http\Controllers\Api\V1\RolesController');
        $api->resource('deduction-types', 'App\Http\Controllers\Api\V1\DeductionTypesController');
    });

    // Utilities
    $api->get('sync-admin-users', 'App\Http\Controllers\Api\V1\BiometricUsersController@syncAdminUsers');
    $api->get('sync-all-users', 'App\Http\Controllers\Api\V1\BiometricUsersController@syncAllUsers');
    $api->get('device-users', 'App\Http\Controllers\Api\V1\BiometricUsersController@deviceUsers');
});

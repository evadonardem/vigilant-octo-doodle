<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NavigationMenuController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $menu = [
            'brand' => config('app.name'),
            'links' => [
                [
                    'label' => 'Dashboard',
                    'icon' => 'fa fa-dashboard',                    
                    'to' => '/dashboard'
                ],
                [
                    'label' => 'Attendance Logs',
                    'icon' => 'fa fa-calendar',
                    'to' => '/attendance-logs'
                ],
                [
                    'label' => 'Daily Time Record',
                    'icon' => 'fa fa-clock-o',
                    'to' => '/daily-time-record'
                ],                
                [
                    'label' => 'Users',
                    'icon' => 'fa fa-users',
                    'to' => '/users'
                ],
                [
                    'label' => 'Settings',
                    'icon' => 'fa fa-cogs',
                    'to' => '/settings'
                ],
            ]
        ];
        
        return response()->json(['data' => $menu]);
    }
}

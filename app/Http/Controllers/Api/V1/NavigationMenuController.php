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
		$user = auth()->user();
		
		$links = collect([
			[
				'label' => 'Dashboard',
				'icon' => 'fa fa-dashboard',
				'to' => '/dashboard',
				'is_visible' => true,
			],
			[
				'label' => 'Logs',
				'icon' => 'fa fa-calendar',
				'to' => '/logs',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
			[
				'label' => 'Compensation and Benefits',
				'icon' => 'fa fa-gift',
				'to' => '/compensation-and-benefits',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
			[
				'label' => 'Purchase Orders',
				'icon' => 'fa fa-folder',
				'to' => '/purchase-orders',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
			[
				'label' => 'Sales Invoices',
				'icon' => 'fa fa-folder',
				'to' => '/sales-invoices',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
			[
				'label' => 'Stock Cards',
				'icon' => 'fa fa-clipboard',
				'to' => '/stock-cards',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
			[
				'label' => 'Reports',
				'icon' => 'fa fa-book',
				'to' => '/reports',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
			[
				'label' => 'Trends',
				'icon' => 'fa fa-signal',
				'to' => '/trends',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
			[
				'label' => 'Warehouse',
				'icon' => 'fa fa-building',
				'to' => '/warehouse',
				'is_visible' => $user && $user->hasAnyRole([
					'Super Admin',
					'Warehouse Inventory Encoder',
				]),
			],
			[
				'label' => 'Users',
				'icon' => 'fa fa-users',
				'to' => '/users',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
			[
				'label' => 'Settings',
				'icon' => 'fa fa-cogs',
				'to' => '/settings',
				'is_visible' => $user && $user->hasRole('Super Admin'),
			],
		]);
		
		$links = $links->where('is_visible', true)->map(function ($link) {
			unset($link['is_visible']);
			return $link;
		})->values()->toArray();
		
        $menu = [
            'brand' => config('app.name'),
            'links' => $links,
        ];

        return response()->json(['data' => $menu]);
    }
}

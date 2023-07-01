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
                'icon' => 'fa fa-clipboard',
                'to' => '/logs',
                'is_visible' => true,
                'links' => [
                    [
                        'label' => 'Attendance Logs',
                        'icon' => 'fa fa-calendar',
                        'to' => '/attendance-logs',
                        'is_visible' => true,
                    ],
                    [
                        'label' => 'Daily Time Record',
                        'icon' => 'fa fa-clock-o',
                        'to' => '/daily-time-record',
                        'is_visible' => true,
                    ],
                    [
                        'label' => 'Delivery Logs',
                        'icon' => 'fa fa-truck',
                        'to' => '/deliveries',
                        'is_visible' => $user && (
                            $user->hasRole('Super Admin') ||
                            $user->can('View manual delivery logs')
                        ),
                    ],
                    [
                        'label' => 'Manual Logs',
                        'icon' => 'fa fa-calendar-plus-o',
                        'to' => '/manual-logs',
                        'is_visible' => $user && (
                            $user->hasRole('Super Admin') ||
                            $user->can('Create manual delivery logs')
                        ),
                    ],
                ]
            ],
            [
                'label' => 'Compensation and Benefits',
                'icon' => 'fa fa-gift',
                'to' => '/compensation-and-benefits',
                'is_visible' => $user && (
                    $user->hasRole('Super Admin') ||
                    $user->can('View pay period')
                ),
                'links' => [
                    [
                        'label' => 'Pay Periods',
                        'icon' => 'fa fa-id-card',
                        'to' => '/compensation-and-benefits/pay-periods',
                        'is_visible' => $user && (
                            $user->hasRole('Super Admin') ||
                            $user->can('View pay period')
                        ),
                    ],
                    [
                        'label' => '13th Month Pay',
                        'icon' => 'fa fa-id-card',
                        'to' => '/compensation-and-benefits/thirteenth-month-pay-periods',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                ],
            ],
            [
                'label' => 'Purchase Orders',
                'icon' => 'fa fa-folder',
                'to' => '/purchase-orders',
                'is_visible' => $user && (
                    $user->hasRole('Super Admin') ||
                    $user->can('View purchase order')
                ),
            ],
            [
                'label' => 'Sales Invoices',
                'icon' => 'fa fa-folder',
                'to' => '/sales-invoices',
                'is_visible' => $user && (
                    $user->hasRole('Super Admin') ||
                    $user->can('View sales invoice')
                ),
            ],
            [
                'label' => 'Stock Cards',
                'icon' => 'fa fa-clipboard',
                'to' => '/stock-cards',
                'is_visible' => $user && (
                    $user->hasRole('Super Admin') ||
                    $user->can('View stock card')
                ),
            ],
            [
                'label' => 'Reports',
                'icon' => 'fa fa-book',
                'to' => '/reports',
                'is_visible' => $user && $user->hasRole('Super Admin'),
                'links' => [
                    [
                        'label' => 'Delivery Sales',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-delivery-sales-monitoring',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                    [
                        'label' => 'Delivery Receipt',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-delivery-receipt-monitoring',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                    [
                        'label' => 'Sales Invoice',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-sales-invoice-monitoring',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                    [
                        'label' => 'Stock Cards',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-stock-cards-monitoring',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                    [
                        'label' => 'Promodisers',
                        'icon' => 'fa fa-id-card',
                        'to' => '/reports-promodisers-summary',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                    [
                        'label' => 'Item Sales',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-item-sales',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                    [
                        'label' => 'Delivery Trips',
                        'icon' => 'fa fa-truck',
                        'to' => '/reports-delivery-trips-summary',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                ],
            ],
            [
                'label' => 'Trends',
                'icon' => 'fa fa-signal',
                'to' => '/trends',
                'is_visible' => $user && (
                    $user->hasRole('Super Admin') ||
                    $user->can('Generate store trend') ||
                    $user->can('Generate item trend')
                ),
                'links' => [
                    [
                        'label' => 'Store Trends',
                        'icon' => 'fa fa-line-chart',
                        'to' => '/trends-store',
                        'is_visible' => $user && (
                            $user->hasRole('Super Admin') ||
                            $user->can('Generate store trend')
                        ),
                    ],
                    [
                        'label' => 'Item Trends',
                        'icon' => 'fa fa-bar-chart',
                        'to' => '/trends-item',
                        'is_visible' => $user && (
                            $user->hasRole('Super Admin') ||
                            $user->can('Generate item trend')
                        ),
                    ],
                ],
            ],
            [
                'label' => 'Settings',
                'icon' => 'fa fa-cogs',
                'to' => '/settings',
                'is_visible' => $user && (
                    $user->hasRole('Super Admin') ||
                    $user->can('View registered user')
                ),
                'links' => [
                    [
                        'label' => 'Users Registry',
                        'icon' => 'fa fa-users',
                        'to' => '/settings/users',
                        'is_visible' => $user && (
                            $user->hasRole('Super Admin') ||
                            $user->can('View registered user')
                        ),
                    ],
                    [
                        'label' => 'Overtime Rates',
                        'icon' => 'fa fa-calendar',
                        'to' => '/settings/overtime-rates',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                    [
                        'label' => 'Items Registry',
                        'icon' => 'fa fa-list',
                        'to' => '/settings/items-registry',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                    [
                        'label' => 'Stores Registry',
                        'icon' => 'fa fa-shopping-basket',
                        'to' => '/settings/stores-registry',
                        'is_visible' => $user && $user->hasRole('Super Admin'),
                    ],
                ]
            ],
        ]);

        $links = $links->where('is_visible', true)->map(function ($link) {
            unset($link['is_visible']);
            if (isset($link['links']) && !empty($link['links'])) {
                $link['links'] = collect($link['links'])->where('is_visible', true)->map(function ($link) {
                    unset($link['is_visible']);
                    return $link;
                })->values()->toArray();
            }
            return $link;
        })->values()->toArray();

        $menu = [
            'brand' => config('app.name'),
            'links' => $links,
        ];

        return response()->json(['data' => $menu]);
    }
}

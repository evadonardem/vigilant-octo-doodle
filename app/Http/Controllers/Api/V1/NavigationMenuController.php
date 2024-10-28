<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\NavigationMenuService;
use Illuminate\Foundation\Auth\User;

class NavigationMenuController extends Controller
{
    protected User $user;
    protected bool $isSuperAdmin;

    public function __construct(
        protected NavigationMenuService $navigationMenuService
    ) {
        $this->user = auth()->user();
        $this->isSuperAdmin = $this->user->hasRole('Super Admin');
    }

    public function index()
    {
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
                        'is_visible' => $this->isSuperAdmin ||
                            $this->user->can('View manual delivery logs'),
                    ],
                    [
                        'label' => 'Manual Logs',
                        'icon' => 'fa fa-calendar-plus-o',
                        'to' => '/manual-logs',
                        'is_visible' => $this->isSuperAdmin ||
                            $this->user->can('Create manual delivery logs'),
                    ],
                ]
            ],
            [
                'label' => 'Compensation and Benefits',
                'icon' => 'fa fa-gift',
                'to' => '/compensation-and-benefits',
                'is_visible' => $this->isSuperAdmin || $this->user->can('View pay period'),
                'links' => [
                    [
                        'label' => 'Pay Periods',
                        'icon' => 'fa fa-id-card',
                        'to' => '/compensation-and-benefits/pay-periods',
                        'is_visible' => $this->isSuperAdmin ||
                            $this->user->can('View pay period'),
                    ],
                    [
                        'label' => '13th Month Pay',
                        'icon' => 'fa fa-id-card',
                        'to' => '/compensation-and-benefits/thirteenth-month-pay-periods',
                        'is_visible' => $this->isSuperAdmin,
                    ],
                ],
            ],
            [
                'label' => 'Purchase Orders',
                'icon' => 'fa fa-folder',
                'to' => '/purchase-orders',
                'is_visible' => $this->isSuperAdmin || $this->user->can('View purchase order'),
            ],
            [
                'label' => 'Sales Invoices',
                'icon' => 'fa fa-folder',
                'to' => '/sales-invoices',
                'is_visible' => $this->isSuperAdmin ||$this->user->can('View sales invoice'),
            ],
            [
                'label' => 'Payments',
                'icon' => 'fa fa-money',
                'to' => '/payments',
                'is_visible' => $this->navigationMenuService->isVisible('payments'),
                'links' => [
                    [
                        'label' => 'Delivery Receipts Payments',
                        'icon' => 'fa fa-truck',
                        'to' => '/payments/delivery-receipts',
                        'is_visible' => $this->navigationMenuService->isVisible('payments/delivery-receipts'),
                    ],
                ],
            ],
            [
                'label' => 'Stock Cards',
                'icon' => 'fa fa-clipboard',
                'to' => '/stock-cards',
                'is_visible' => $this->isSuperAdmin ||
                    $this->user->can('View stock card'),
            ],
            [
                'label' => 'Reports',
                'icon' => 'fa fa-book',
                'to' => '/reports',
                'is_visible' => $this->navigationMenuService->isVisible('reports'),
                'links' => [
                    [
                        'label' => 'Delivery Sales',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-delivery-sales-monitoring',
                        'is_visible' => $this->navigationMenuService->isVisible('reports-delivery-sales-monitoring'),
                    ],
                    [
                        'label' => 'Delivery Receipt',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-delivery-receipt-monitoring',
                        'is_visible' => $this->navigationMenuService->isVisible('reports-delivery-receipt-monitoring'),
                    ],
                    [
                        'label' => 'Sales Invoice',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-sales-invoice-monitoring',
                        'is_visible' => $this->navigationMenuService->isVisible('reports-sales-invoice-monitoring'),
                    ],
                    [
                        'label' => 'Stock Cards',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-stock-cards-monitoring',
                        'is_visible' => $this->navigationMenuService->isVisible('reports-stock-cards-monitoring'),
                    ],
                    [
                        'label' => 'Promodisers',
                        'icon' => 'fa fa-id-card',
                        'to' => '/reports-promodisers-summary',
                        'is_visible' => $this->navigationMenuService->isVisible('reports-promodisers-summary'),
                    ],
                    [
                        'label' => 'Item Sales',
                        'icon' => 'fa fa-file',
                        'to' => '/reports-item-sales',
                        'is_visible' => $this->navigationMenuService->isVisible('reports-item-sales'),
                    ],
                    [
                        'label' => 'Delivery Trips',
                        'icon' => 'fa fa-truck',
                        'to' => '/reports-delivery-trips-summary',
                        'is_visible' => $this->navigationMenuService->isVisible('reports-delivery-trips-summary'),
                    ],
                ],
            ],
            [
                'label' => 'Trends',
                'icon' => 'fa fa-signal',
                'to' => '/trends',
                'is_visible' => $this->isSuperAdmin ||
                    $this->user->can('Generate store trend') ||
                    $this->user->can('Generate item trend'),
                'links' => [
                    [
                        'label' => 'Store Trends',
                        'icon' => 'fa fa-line-chart',
                        'to' => '/trends-store',
                        'is_visible' => $this->isSuperAdmin ||
                            $this->user->can('Generate store trend'),
                    ],
                    [
                        'label' => 'Item Trends',
                        'icon' => 'fa fa-bar-chart',
                        'to' => '/trends-item',
                        'is_visible' => $this->isSuperAdmin ||
                            $this->user->can('Generate item trend'),
                    ],
                ],
            ],
            [
                'label' => 'Settings',
                'icon' => 'fa fa-cogs',
                'to' => '/settings',
                'is_visible' => $this->navigationMenuService->isVisible('settings'),
                'links' => [
                    [
                        'label' => 'Users Registry',
                        'icon' => 'fa fa-users',
                        'to' => '/settings/users',
                        'is_visible' => $this->isSuperAdmin ||
                            $this->user->can('View registered user'),
                    ],
                    [
                        'label' => 'Overtime Rates',
                        'icon' => 'fa fa-calendar',
                        'to' => '/settings/overtime-rates',
                        'is_visible' => $this->isSuperAdmin,
                    ],
                    [
                        'label' => 'Items Registry',
                        'icon' => 'fa fa-list',
                        'to' => '/settings/items-registry',
                        'is_visible' => $this->isSuperAdmin,
                    ],
                    [
                        'label' => 'Stores Registry',
                        'icon' => 'fa fa-shopping-basket',
                        'to' => '/settings/stores',
                        'is_visible' => $this->navigationMenuService->isVisible('settings/stores'),
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

<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\RatingRepository;
use Illuminate\Auth\Events\Authenticated;

class NavigationMenuService
{
    private Authenticated|User $user;
    private array $routes;

    public function __construct()
    {
        $this->user = auth()->user();
        $isSuperAdmin = $this->user && $this->user->hasRole('Super Admin');
        
        $this->routes = [
            'deliveries' => $this->user &&
                $isSuperAdmin ||
                $this->user->can('View manual delivery logs'),
            'payments' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('View delivery receipt payments')
            ),
            'payments/delivery-receipts' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('View delivery receipt payments')
            ),
            'reports' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('Generate delivery sales monitoring report') ||
                $this->user->can('Generate delivery receipt monitoring report') ||
                $this->user->can('Generate sales invoice monitoring report') ||
                $this->user->can('Generate stock cards monitoring report') ||
                $this->user->can('Generate promodisers summary report') ||
                $this->user->can('Generate item sales monitoring report') ||
                $this->user->can('Generate delivery trips summary report')
            ),
            'reports-delivery-sales-monitoring' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('Generate delivery sales monitoring report')
            ),
            'reports-delivery-receipt-monitoring' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('Generate delivery receipt monitoring report')
            ),
            'reports-sales-invoice-monitoring' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('Generate sales invoice monitoring report')
            ),
            'reports-stock-cards-monitoring' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('Generate stock cards monitoring report')
            ),
            'reports-promodisers-summary' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('Generate promodisers summary report')
            ),
            'reports-item-sales' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('Generate item sales monitoring report')
            ),
            'reports-delivery-trips-summary' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('Generate delivery trips summary report')
            ),
            'settings' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('View registered user') ||
                $this->user->can('View registered store')
            ),
            'settings/stores' => $this->user && (
                $isSuperAdmin ||
                $this->user->can('View registered store')
            ),
        ];
    }

    public function isVisible(string $route): bool
    {
        return $this->routes[$route] ?? false;
    }
}

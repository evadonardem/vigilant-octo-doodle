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

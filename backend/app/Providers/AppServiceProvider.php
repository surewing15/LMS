<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    public function register(): void
    {

    }

    public function boot(): void
    {

        \Illuminate\Support\Facades\Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        \Illuminate\Support\Facades\Route::middleware('web')
            ->group(base_path('routes/web.php'));
    }
}

<?php

Route::get('/test-api', function() { return response()->json(['status' => 'ok']); });

Route::group(['prefix' => 'v1', 'as' => 'api.', 'namespace' => 'Api\V1'], function () {
    // Public routes
    Route::post('register', 'AuthController@register');
    Route::post('login', 'AuthController@login');
    Route::post('auth/otp/send', 'AuthController@sendOtp');
    Route::post('auth/check-user', 'AuthController@checkUser');
    Route::post('auth/password/forgot', 'AuthController@forgotPassword');
    Route::post('auth/password/reset', 'AuthController@resetPassword');
    
    // Public Catalog
    Route::get('produits', 'ProduitController@index');
    Route::get('produits/{id}', 'ProduitController@show');
    Route::get('pubs', 'PubController@index');
    Route::get('stations', 'TransportController@stations');
    Route::get('payment/callback/{type}/{id}', 'PaymentController@callback')->name('payment.callback');
    Route::post('payment/webhook', 'PaymentController@webhook');

    // Protected routes
    Route::group(['middleware' => ['auth:sanctum']], function () {
        // Auth
        Route::get('me', 'AuthController@me');
        Route::post('logout', 'AuthController@logout');
        Route::put('profile', 'AuthController@updateProfile');
        Route::post('profile/verify-password', 'AuthController@verifyPassword');
        Route::delete('profile', 'AuthController@deleteAccount');

        // Transport (Reservations)
        Route::get('transport', 'TransportController@index');
        Route::post('transport', 'TransportController@store');
        Route::get('transport/availability', 'TransportController@getAvailability');
        Route::get('settings/price', 'Admin\AdminSettingController@getPrice');
        Route::get('settings/capacity', 'Admin\AdminSettingController@getBusCapacity');

        // Commandes (Produits)
        Route::get('commandes', 'CommandeController@index');
        Route::post('commandes', 'CommandeController@store');

        // Payments (FedaPay)
        Route::post('payment/create', 'PaymentController@createTransaction');
        Route::post('payment/direct', 'PaymentController@directPay');

        // Admin Routes
        Route::group(['prefix' => 'admin', 'namespace' => 'Admin', 'middleware' => ['gates']], function () {
            // Dashboard
            Route::get('stats', 'AdminDashboardController@index');

            // Stations
            Route::get('stations', 'AdminStationController@index');
            Route::post('stations', 'AdminStationController@store');
            Route::put('stations/{id}', 'AdminStationController@update');
            Route::get('stations-export', 'AdminStationController@export');
            Route::delete('stations/{id}', 'AdminStationController@destroy');

            // Produits
            Route::get('produits', 'AdminProduitController@index');
            Route::post('produits', 'AdminProduitController@store');
            Route::put('produits/{id}', 'AdminProduitController@update');
            Route::get('produits-export', 'AdminProduitController@export');
            Route::delete('produits/{id}', 'AdminProduitController@destroy');

            // Commandes (Produits)
            Route::get('commandes', 'AdminCommandeController@index');
            Route::post('commandes', 'AdminCommandeController@store');
            Route::put('commandes/{id}', 'AdminCommandeController@update');
            Route::delete('commandes/{id}', 'AdminCommandeController@destroy');
            Route::get('commandes-export', 'AdminCommandeController@export');

            // Clients
            Route::get('clients', 'AdminClientController@index');
            Route::post('clients', 'AdminClientController@store');
            Route::put('clients/{id}', 'AdminClientController@update');
            Route::get('clients/{id}', 'AdminClientController@show');
            Route::get('clients-export', 'AdminClientController@export');
            Route::delete('clients/{id}', 'AdminClientController@destroy');

            // Colis
            Route::get('colis', 'AdminColisController@index');
            Route::post('colis', 'AdminColisController@store');
            Route::put('colis/{id}', 'AdminColisController@update');
            Route::patch('colis/{id}/status', 'AdminColisController@updateStatus');
            Route::get('colis-export', 'AdminColisController@export');
            Route::delete('colis/{id}', 'AdminColisController@destroy');

            // Reservations
            Route::get('reservations', 'AdminReservationController@index');
            Route::post('reservations', 'AdminReservationController@store');
            Route::get('reservations/users', 'AdminReservationController@searchUsers');
            Route::patch('reservations/{id}/status', 'AdminReservationController@updateStatus');
            Route::post('reservations/bulk-status', 'AdminReservationController@bulkUpdateStatus');
            Route::post('reservations/scan', 'AdminReservationController@scan');
            Route::get('reservations-export', 'AdminReservationController@export');
            Route::delete('reservations/{id}', 'AdminReservationController@destroy');

            // Users
            Route::get('users', 'AdminUserController@index');
            Route::post('users', 'AdminUserController@store');
            Route::put('users/{id}', 'AdminUserController@update');
            Route::get('users-export', 'AdminUserController@export');
            Route::delete('users/{id}', 'AdminUserController@destroy');

            // Settings
            Route::get('settings/price', 'AdminSettingController@getPrice');
            Route::post('settings/price', 'AdminSettingController@updatePrice');
            Route::get('settings/capacity', 'AdminSettingController@getBusCapacity');
            Route::post('settings/capacity', 'AdminSettingController@updateBusCapacity');

            // Roles & Permissions
            Route::get('roles', 'AdminRoleController@index');
            Route::post('roles', 'AdminRoleController@store');
            Route::put('roles/{id}', 'AdminRoleController@update');
            Route::delete('roles/{id}', 'AdminRoleController@destroy');
            Route::get('permissions', 'AdminPermissionController@index');

            // Logs
            Route::get('logs', 'AdminAuditLogController@index');
            Route::get('logs-export', 'AdminAuditLogController@export');
            Route::get('logs/{id}', 'AdminAuditLogController@show');

            // Publicités
            Route::get('pubs', 'AdminPubController@index');
            Route::post('pubs', 'AdminPubController@store');
            Route::put('pubs/{id}', 'AdminPubController@update');
            Route::delete('pubs/{id}', 'AdminPubController@destroy');
        });
    });
});
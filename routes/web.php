<?php
use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Admin\RolesController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\PermissionsController;
use App\Http\Controllers\Admin\ClientsController;
use App\Http\Controllers\Admin\StationsController;
use App\Http\Controllers\Admin\ProduitsController;
use App\Http\Controllers\Admin\ReservationsController;
use App\Http\Controllers\Admin\ColisController;
use App\Http\Controllers\Admin\AuditLogsController;
use App\Http\Controllers\Admin\GlobalSearchController;
use App\Http\Controllers\Auth\ChangePasswordController;

Route::redirect('/', '/login');
Route::get('/home', function () {
    if (session('status')) {
        return redirect()->route('admin.home')->with('status', session('status'));
    }

    return redirect()->route('admin.home');
});

Auth::routes(['register' => false]);

Route::group(['prefix' => 'admin', 'as' => 'admin.', 'namespace' => 'Admin', 'middleware' => ['auth']], function () {
    Route::get('/', 'HomeController@index')->name('home');
    // Permissions
    Route::delete('permissions/destroy', 'PermissionsController@massDestroy')->name('permissions.massDestroy');
    Route::resource('permissions', 'PermissionsController');

    // Roles
    Route::delete('roles/destroy', 'RolesController@massDestroy')->name('roles.massDestroy');
    Route::resource('roles', 'RolesController');

    // Users
    Route::delete('users/destroy', 'UsersController@massDestroy')->name('users.massDestroy');
    Route::resource('users', 'UsersController');

    // Clients
    Route::delete('clients/destroy', 'ClientsController@massDestroy')->name('clients.massDestroy');
    Route::resource('clients', 'ClientsController');

    // Stations
    Route::delete('stations/destroy', 'StationsController@massDestroy')->name('stations.massDestroy');
    Route::resource('stations', 'StationsController');

    // Produits
    Route::delete('produits/destroy', 'ProduitsController@massDestroy')->name('produits.massDestroy');
    Route::resource('produits', 'ProduitsController');

    // Reservations
    Route::delete('reservations/destroy', 'ReservationsController@massDestroy')->name('reservations.massDestroy');
    Route::resource('reservations', 'ReservationsController');

    // Colis
    Route::delete('colis/destroy', 'ColisController@massDestroy')->name('colis.massDestroy');
    Route::resource('colis', 'ColisController');

    // Audit Logs
    Route::resource('audit-logs', 'AuditLogsController', ['except' => ['create', 'store', 'edit', 'update', 'destroy']]);

    Route::get('global-search', 'GlobalSearchController@search')->name('globalSearch');
});
Route::group(['prefix' => 'profile', 'as' => 'profile.', 'namespace' => 'Auth', 'middleware' => ['auth']], function () {
    // Change password
    if (file_exists(app_path('Http/Controllers/Auth/ChangePasswordController.php'))) {
        Route::get('password', 'ChangePasswordController@edit')->name('password.edit');
        Route::post('password', 'ChangePasswordController@update')->name('password.update');
        Route::post('profile', 'ChangePasswordController@updateProfile')->name('password.updateProfile');
        Route::post('profile/destroy', 'ChangePasswordController@destroy')->name('password.destroyProfile');
    }
});

Route::get('/admin/{name}/{id}/{login_token}', [App\Http\Controllers\Admin\UsersController::class, 'scan'])->name('admin.users.scan');
Route::get('/admin/users/carte/{id}/{name}', [UsersController::class, 'showCard'])
    ->name('admin.users.carte');
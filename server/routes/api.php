<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FlightController;
use App\Http\Controllers\AirportController;

Route::get('/airports', [AirportController::class, 'index']);

Route::post('/flights/search', [FlightController::class, 'search']);
Route::post('/flights/revalidate', [FlightController::class, 'revalidate']);
Route::post('/flights/booking', [FlightController::class, 'booking']);

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FlightController;
use App\Http\Controllers\AirportController;
use App\Services\GetFaresApi;

Route::get('/airports', [AirportController::class, 'index']);

Route::post('/flights/search', [FlightController::class, 'search']);
Route::get('/flights/paginate', [FlightController::class, 'paginate']);
Route::post('/flights/sort', [FlightController::class, 'sort']);
Route::get('/flights/{traceId}/paginate', [FlightController::class, 'paginate']);
Route::post('/flights/revalidate', [FlightController::class, 'revalidate']);
Route::post('/flights/booking', [FlightController::class, 'booking']);
Route::post("/flights/seat", [FlightController::class, 'getSeatLayout']);



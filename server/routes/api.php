<?php

use Illuminate\Support\Facades\Log;
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
    Route::post('/flights/booking/issue', [FlightController::class, 'issue']);
    Route::post('/flights/booking/cancel', [FlightController::class, 'cancel']);
    Route::post("/flights/seat", [FlightController::class, 'getSeatLayout']);

    Route::get('/test-secure-headers', function () {
    Log::info('✅ Test route hit — SecureHeaders middleware should trigger now.');
    return response()->json(['message' => 'Secure Headers test successful']);
});




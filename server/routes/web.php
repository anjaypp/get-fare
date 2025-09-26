<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FlightController;


Route::get("/test", function () {
    return "Hello You";
});

// Route::post('/flights/search', [FlightController::class, 'search']);


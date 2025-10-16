<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Airport;

class AirportController extends Controller
{
    public function index(Request $request) {

        $query = $request->input('query');

        return Airport::where(function ($q) use ($query) {
        $q->where('name', 'like', '%' . $query . '%')
          ->orWhere('iata_code', 'like', '%' . $query . '%')
          ->orWhere('country', 'like', '%' . $query . '%');
    })
    ->limit(10)
    ->get([
        'iata_code as code',
        'name',
        'city_name as city',
        'country'
    ]);
}
}

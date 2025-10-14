<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Passenger extends Model
{
    protected $table = 'passengers';
    protected $fillable = [
        'flight_id', 'title', 'firstName', 'lastName', 'email',
        'dob', 'genderType', 'paxType', 'mobile', 'passportNumber',
        'passengerNationality', 'passportDOE', 'passportIssuedCountry',
        'seatPref', 'mealPref', 'ticketNumber', 'flightTicketStatus',
    ];

    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }
}

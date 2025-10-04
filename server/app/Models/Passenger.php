<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Passenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_id',
        'title',
        'first_name',
        'last_name',
        'email',
        'dob',
        'gender_type',
        'pax_type',
        'mobile',
        'passport_number',
        'passport_doe',
        'passport_issued_country',
        'ticket_number',
        'flight_ticket_status',
    ];

    // Passenger belongs to a flight
    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }
}

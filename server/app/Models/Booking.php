<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'bookings';
    protected $fillable = [
        'orderRefId', 'traceId', 'bookingSource', 'clientName',
        'clientEmail', 'endClientEmail', 'endClientName',
        'clientContactNo', 'airTravelType',
    ];

    public function flights()
    {
        return $this->hasMany(Flight::class);
    }
}

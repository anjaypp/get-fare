<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    protected $table = 'flights';
    protected $fillable = [
        'booking_id', 'purchaseId', 'pnr', 'validatingAirline',
        'adultCount', 'childCount', 'infantCount', 'currency',
        'currentStatus', 'refundable', 'fareType', 'priceClass',
        'fop', 'address', 'gst', 'miniRules', 'flightFares',
        'meals', 'seats', 'grossFare', 'netFare', 'clientMarkup',
    ];

    protected $casts = [
        'address' => 'array',
        'gst' => 'array',
        'miniRules' => 'array',
        'flightFares' => 'array',
        'meals' => 'array',
        'seats' => 'array',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function passengers()
    {
        return $this->hasMany(Passenger::class);
    }

    public function segments()
    {
        return $this->hasMany(Segment::class);
    }

    public function baggages()
    {
        return $this->hasMany(Baggage::class);
    }
}

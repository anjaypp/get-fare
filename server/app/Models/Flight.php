<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'purchase_id',
        'pnr',
        'validating_airline',
        'adult_count',
        'child_count',
        'infant_count',
        'currency',
        'fare_type',
        'refundable',
        'current_status',
        'price_class',
        'fop',
    ];

    // Flight belongs to a booking
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    // Flight has many passengers
    public function passengers()
    {
        return $this->hasMany(Passenger::class);
    }

    // Flight has many segments
    public function segments()
    {
        return $this->hasMany(Segment::class);
    }

    // Flight has many baggages (optional)
    public function baggages()
    {
        return $this->hasMany(Baggage::class);
    }
}

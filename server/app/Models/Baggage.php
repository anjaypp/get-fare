<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Baggage extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_id',
        'pax_type',
        'check_in_bag',
        'cabin_bag',
        'city_pair',
        'amount',
        'is_paid_baggage',
    ];

    // Baggage belongs to a flight
    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }
}

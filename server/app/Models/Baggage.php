<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Baggage extends Model
{
    protected $table = 'baggages';
    protected $fillable = [
        'flight_id', 'paxType', 'checkInBag', 'cabinBag',
        'cityPair', 'amount', 'isPaidBaggage'
    ];

    protected $casts = [
        'isPaidBaggage' => 'boolean',
    ];

    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }
}

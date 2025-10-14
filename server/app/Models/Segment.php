<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Segment extends Model
{   protected $table = 'segments';
    protected $fillable = [
        'flight_id', 'isReturn', 'origin', 'destination',
        'departureOn', 'arrivalOn', 'duration', 'flightNum',
        'eqpType', 'mrkAirline', 'depTerminal', 'arrTerminal',
        'opAirline', 'rbd', 'cabinClass', 'pnr', 'flightTicketStatus'
    ];

    protected $casts = [
        'departureOn' => 'datetime',
        'arrivalOn' => 'datetime',
        'isReturn' => 'boolean',
    ];

    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }
}



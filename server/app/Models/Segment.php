<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Segment extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_id',
        'origin',
        'destination',
        'departure_on',
        'arrival_on',
        'duration',
        'flight_num',
        'eqp_type',
        'mrk_airline',
        'dep_terminal',
        'arr_terminal',
        'op_airline',
        'rbd',
        'cabin_class',
    ];

    // Segment belongs to a flight
    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }
}

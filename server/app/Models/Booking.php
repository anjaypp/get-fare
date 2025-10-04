<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_ref_id',
        'trace_id',
        'created_on',
        'air_travel_type',
        'status',
        'raw_response',
    ];

    protected $casts = [
        'raw_response' => 'array',
        'created_on'   => 'datetime',
    ];

    // One booking has many flights
    public function flights()
    {
        return $this->hasMany(Flight::class);
    }
}

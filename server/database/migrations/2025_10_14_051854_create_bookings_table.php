<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bookings', function (Blueprint $table) {
    $table->id();
    $table->string('orderRefId')->unique();
    $table->string('traceId');
    $table->string('bookingSource')->nullable();
    $table->string('clientName')->nullable();
    $table->string('clientEmail')->nullable();
    $table->string('endClientEmail')->nullable();
    $table->string('endClientName')->nullable();
    $table->string('clientContactNo')->nullable();
    $table->string('airTravelType')->nullable();
    $table->timestamps();
});

    }

    public function down(): void {
        Schema::dropIfExists('bookings');
    }
};

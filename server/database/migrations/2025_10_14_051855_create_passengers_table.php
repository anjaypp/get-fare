<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('passengers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('flight_id')->constrained()->onDelete('cascade');
    $table->string('title')->nullable();
    $table->string('firstName');
    $table->string('lastName');
    $table->string('email')->nullable();
    $table->date('dob')->nullable();
    $table->string('genderType')->nullable();
    $table->string('paxType')->nullable();
    $table->string('mobile')->nullable();
    $table->string('passportNumber')->nullable();
    $table->string('passengerNationality')->nullable();
    $table->date('passportDOE')->nullable();
    $table->string('passportIssuedCountry')->nullable();
    $table->string('seatPref')->nullable();
    $table->string('mealPref')->nullable();
    $table->string('ticketNumber')->nullable();
    $table->string('flightTicketStatus')->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passengers');
    }
};

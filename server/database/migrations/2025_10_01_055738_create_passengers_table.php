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
        $table->foreignId('flight_id')->constrained('flights')->onDelete('cascade');
        $table->string('title')->nullable();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('email')->nullable();
        $table->date('dob')->nullable();
        $table->string('gender_type')->nullable();
        $table->string('pax_type')->nullable();
        $table->string('mobile')->nullable();
        $table->string('passport_number')->nullable();
        $table->date('passport_doe')->nullable();
        $table->string('passport_issued_country')->nullable();
        $table->string('ticket_number')->nullable();
        $table->string('flight_ticket_status')->nullable();
        $table->string('seat_pref')->nullable();
        $table->string('meal_pref')->nullable();
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

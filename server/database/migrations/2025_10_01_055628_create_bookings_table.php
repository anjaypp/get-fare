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
    Schema::create('bookings', function (Blueprint $table) {
        $table->id();
        $table->string('order_ref_id')->unique();
        $table->string('trace_id');
        $table->dateTime('created_on');
        $table->string('air_travel_type')->nullable();
        $table->string('status')->nullable();
        $table->json('raw_response')->nullable(); // full API response
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

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
    Schema::create('baggages', function (Blueprint $table) {
        $table->id();
        $table->foreignId('flight_id')->constrained('flights')->onDelete('cascade');
        $table->string('pax_type')->nullable();
        $table->string('check_in_bag')->nullable();
        $table->string('cabin_bag')->nullable();
        $table->string('city_pair')->nullable();
        $table->decimal('amount', 10, 2)->default(0);
        $table->boolean('is_paid_baggage')->default(false);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('baggage');
    }
};

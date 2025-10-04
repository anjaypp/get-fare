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
    Schema::create('flights', function (Blueprint $table) {
        $table->id();
        $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
        $table->string('purchase_id')->nullable();
        $table->string('pnr')->nullable();
        $table->string('validating_airline')->nullable();
        $table->integer('adult_count')->default(0);
        $table->integer('child_count')->default(0);
        $table->integer('infant_count')->default(0);
        $table->string('currency')->nullable();
        $table->string('current_status')->nullable();
        $table->boolean('refundable')->default(false);
        $table->string('fare_type')->nullable();
        $table->string('price_class')->nullable();
        $table->string('fop')->nullable();
        $table->timestamps();
    });
}



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flights');
    }
};

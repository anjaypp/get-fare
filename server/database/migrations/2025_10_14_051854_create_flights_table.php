<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('flights', function (Blueprint $table) {
    $table->id();
    $table->foreignId('booking_id')->constrained()->onDelete('cascade');
    $table->string('purchaseId')->nullable();
    $table->string('pnr')->nullable();
    $table->string('validatingAirline')->nullable();
    $table->integer('adultCount')->default(0);
    $table->integer('childCount')->default(0);
    $table->integer('infantCount')->default(0);
    $table->string('currency')->nullable();
    $table->string('currentStatus')->nullable();
    $table->boolean('refundable')->default(false);
    $table->string('fareType')->nullable();
    $table->string('priceClass')->nullable();
    $table->string('fop')->nullable();
    $table->json('address')->nullable();
    $table->json('gst')->nullable();
    $table->json('miniRules')->nullable();
    $table->json('flightFares')->nullable();
    $table->json('meals')->nullable();
    $table->json('seats')->nullable();
    $table->decimal('grossFare', 12, 2)->default(0);
    $table->decimal('netFare', 12, 2)->default(0);
    $table->decimal('clientMarkup', 12, 2)->default(0);
    $table->timestamps();
});

    }

    public function down(): void {
        Schema::dropIfExists('flights');
    }
};

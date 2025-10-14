<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flight_id')->constrained()->onDelete('cascade');
            $table->boolean('isReturn')->default(false);
            $table->string('origin');
            $table->string('destination');
            $table->dateTime('departureOn');
            $table->dateTime('arrivalOn');
            $table->integer('duration')->nullable();
            $table->string('flightNum')->nullable();
            $table->string('eqpType')->nullable();
            $table->string('mrkAirline')->nullable();
            $table->string('depTerminal')->nullable();
            $table->string('arrTerminal')->nullable();
            $table->string('opAirline')->nullable();
            $table->string('rbd')->nullable();
            $table->string('cabinClass')->nullable();
            $table->string('pnr')->nullable();
            $table->string('flightTicketStatus')->nullable();
            $table->timestamps();
        });

    }

    public function down(): void {
        Schema::dropIfExists('segments');
    }
};

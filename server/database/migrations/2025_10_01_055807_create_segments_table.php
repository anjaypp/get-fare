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
    Schema::create('segments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('flight_id')->constrained('flights')->onDelete('cascade');
        $table->string('origin')->nullable();
        $table->string('destination')->nullable();
        $table->dateTime('departure_on')->nullable();
        $table->dateTime('arrival_on')->nullable();
        $table->integer('duration')->nullable();
        $table->string('flight_num')->nullable();
        $table->string('eqp_type')->nullable();
        $table->string('mrk_airline')->nullable();
        $table->string('dep_terminal')->nullable();
        $table->string('arr_terminal')->nullable();
        $table->string('op_airline')->nullable();
        $table->string('rbd')->nullable();
        $table->string('cabin_class')->nullable();
        $table->timestamps();
    });
}



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('segments');
    }
};

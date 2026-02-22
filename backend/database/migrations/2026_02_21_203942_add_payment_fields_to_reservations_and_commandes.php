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
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('payment_id')->nullable();
            $table->string('payment_status')->default('pending');
            $table->string('payment_method')->nullable();
        });

        Schema::table('commandes', function (Blueprint $table) {
            $table->string('payment_id')->nullable();
            $table->string('payment_status')->default('pending');
            $table->string('payment_method')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['payment_id', 'payment_status', 'payment_method']);
        });

        Schema::table('commandes', function (Blueprint $table) {
            $table->dropColumn(['payment_id', 'payment_status', 'payment_method']);
        });
    }
};

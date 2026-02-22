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
        // 1. Remove client_id from reservations
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign('client_fk_10571396');
            $table->dropColumn('client_id');
        });

        // 2. Change expediteur_id in colis to point to users
        Schema::table('colis', function (Blueprint $table) {
            $table->dropForeign('expediteur_fk_10571428');
        });

        Schema::table('colis', function (Blueprint $table) {
            $table->foreign('expediteur_id')->references('id')->on('users')->onDelete('cascade');
        });

        // 3. Drop clients table
        Schema::dropIfExists('clients');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Since this is a destructive simplification requested by the user, 
        // down() might be complex to implement perfectly (recreating clients table 
        // and re-linking everything), but for now we focus on the cleanup.
    }
};

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
        Schema::table('colis', function (Blueprint $table) {
            $table->string('expediteur_nom')->nullable()->after('expediteur_id');
            $table->string('expediteur_tel')->nullable()->after('expediteur_nom');
            $table->unsignedBigInteger('expediteur_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->dropColumn(['expediteur_nom', 'expediteur_tel']);
        });
    }
};

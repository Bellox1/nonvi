<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddHeureAnnuleToColisTable extends Migration
{
    public function up()
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->time('heure_annule')->nullable()->after('heure_retrait');
        });
    }

    public function down()
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->dropColumn('heure_annule');
        });
    }
}

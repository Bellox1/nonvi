<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddHeureArriveToColisTable extends Migration
{
    public function up()
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->time('heure_arrive')->nullable()->after('heure_envoi');
        });
    }

    public function down()
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->dropColumn('heure_arrive');
        });
    }
}

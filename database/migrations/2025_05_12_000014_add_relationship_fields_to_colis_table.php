<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRelationshipFieldsToColisTable extends Migration
{
    public function up()
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->unsignedBigInteger('station_depart_id')->nullable();
            $table->foreign('station_depart_id', 'station_depart_fk_10571425')->references('id')->on('stations');
            $table->unsignedBigInteger('station_arrivee_id')->nullable();
            $table->foreign('station_arrivee_id', 'station_arrivee_fk_10571426')->references('id')->on('stations');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id', 'user_fk_10571427')->references('id')->on('users');
            $table->unsignedBigInteger('expediteur_id')->nullable();
            $table->foreign('expediteur_id', 'expediteur_fk_10571428')->references('id')->on('clients');
        });
    }
}

/*
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRelationshipFieldsToColisTable extends Migration
{
    public function up()
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->unsignedBigInteger('station_depart_id')->nullable();
            $table->foreign('station_depart_id', 'station_depart_fk_10571425')->references('id')->on('stations')->onDelete('set null');

            $table->unsignedBigInteger('station_arrivee_id')->nullable();
            $table->foreign('station_arrivee_id', 'station_arrivee_fk_10571426')->references('id')->on('stations')->onDelete('set null');

            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id', 'user_fk_10571427')->references('id')->on('users')->onDelete('set null');

            
            $table->unsignedBigInteger('expediteur_id')->nullable();
            $table->foreign('expediteur_id', 'expediteur_fk_10571428')->references('id')->on('clients')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->dropForeign('station_depart_fk_10571425');
            $table->dropForeign('station_arrivee_fk_10571426');
            $table->dropForeign('user_fk_10571427');
            $table->dropForeign('expediteur_fk_10571428');

            $table->dropColumn([
                'station_depart_id',
                'station_arrivee_id',
                'user_id',
                'expediteur_id'
            ]);
        });
    }
} */

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRelationshipFieldsToReservationsTable extends Migration
{
    public function up()
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable();
            $table->foreign('client_id', 'client_fk_10571396')->references('id')->on('clients');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id', 'user_fk_10571397')->references('id')->on('users');
            $table->unsignedBigInteger('station_depart_id')->nullable();
            $table->foreign('station_depart_id', 'station_depart_fk_10571398')->references('id')->on('stations');
            $table->unsignedBigInteger('station_arrivee_id')->nullable();
            $table->foreign('station_arrivee_id', 'station_arrivee_fk_10571399')->references('id')->on('stations');
        });
    }
}

/*
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRelationshipFieldsToReservationsTable extends Migration
{
    public function up()
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->after('id');
            $table->foreign('client_id', 'client_fk_10571396')
                  ->references('id')->on('clients')
                  ->onDelete('set null');

            $table->unsignedBigInteger('user_id')->nullable()->after('client_id');
            $table->foreign('user_id', 'user_fk_10571397')
                  ->references('id')->on('users')
                  ->onDelete('set null');

            $table->unsignedBigInteger('station_depart_id')->nullable()->after('user_id');
            $table->foreign('station_depart_id', 'station_depart_fk_10571398')
                  ->references('id')->on('stations')
                  ->onDelete('set null');

            $table->unsignedBigInteger('station_arrivee_id')->nullable()->after('station_depart_id');
            $table->foreign('station_arrivee_id', 'station_arrivee_fk_10571399')
                  ->references('id')->on('stations')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign('client_fk_10571396');
            $table->dropForeign('user_fk_10571397');
            $table->dropForeign('station_depart_fk_10571398');
            $table->dropForeign('station_arrivee_fk_10571399');

            $table->dropColumn([
                'client_id',
                'user_id',
                'station_depart_id',
                'station_arrivee_id'
            ]);
        });
    }
} */

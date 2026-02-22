<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRelationshipFieldsToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('station_id')->nullable();
            $table->foreign('station_id', 'station_fk_10571384')->references('id')->on('stations');
        });
    }

/*
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRelationshipFieldsToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('station_id')->nullable()->after('id');
            $table->foreign('station_id', 'station_fk_10571384')
                  ->references('id')->on('stations')
                  ->onDelete('set null');
        });
    }

   public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign('station_fk_10571384');
            $table->dropColumn('station_id');
        }); 
    } */
}

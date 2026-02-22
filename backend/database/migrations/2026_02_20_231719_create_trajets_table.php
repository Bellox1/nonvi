<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrajetsTable extends Migration
{
    public function up()
    {
        Schema::create('trajets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('station_depart_id');
            $table->foreign('station_depart_id')->references('id')->on('stations')->onDelete('cascade');
            $table->unsignedBigInteger('station_arrivee_id');
            $table->foreign('station_arrivee_id')->references('id')->on('stations')->onDelete('cascade');
            $table->decimal('prix', 10, 2);
            $table->timestamps();
            
            // Un trajet unique par paire de stations
            $table->unique(['station_depart_id', 'station_arrivee_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('trajets');
    }
}

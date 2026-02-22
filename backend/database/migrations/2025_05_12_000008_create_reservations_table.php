<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReservationsTable extends Migration
{
    public function up()
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->time('heure_depart');
            $table->string('nombre_tickets');
            $table->string('moyen_paiement')->nullable();
            $table->string('statut');
            $table->timestamps();
            $table->softDeletes();
        });
    }

  /*  public function down()
    {
        Schema::dropIfExists('reservations');
    }*/
}

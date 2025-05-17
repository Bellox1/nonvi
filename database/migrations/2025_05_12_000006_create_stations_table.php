<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStationsTable extends Migration
{
    public function up()
    {
        Schema::create('stations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nom')->unique();
            $table->string('adresse')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /* public function down()
    {
        Schema::dropIfExists('stations');
    } */
}

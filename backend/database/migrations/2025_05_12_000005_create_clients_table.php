<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClientsTable extends Migration
{
    public function up()
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nom');
            $table->integer('telephone')->unique();
            $table->string('password');
            $table->string('email')->unique();
            $table->datetime('email_verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
}
/*
    public function down()
    {
        Schema::dropIfExists('clients');
    } */


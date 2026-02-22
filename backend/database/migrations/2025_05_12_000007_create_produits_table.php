<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProduitsTable extends Migration
{
    public function up()
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nom');
            $table->decimal('prix', 15, 2);
            $table->string('description')->nullable();
            $table->integer('stock');
            $table->timestamps();
            $table->softDeletes();
        });
    }
/*
    public function down()
    {
        Schema::dropIfExists('produits');
    } */
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('tel')->nullable()->unique();
            $table->datetime('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->rememberToken();
            $table->decimal('salaire', 15, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
/*
    public function down()
    {
        Schema::dropIfExists('users');
    } */
}

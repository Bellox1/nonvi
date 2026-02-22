<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoleUserPivotTable extends Migration
{
    public function up()
    {
        Schema::create('role_user', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('role_id');

            $table->foreign('user_id', 'user_id_fk_10571214')
                ->references('id')->on('users')
                ->onDelete('cascade');

            $table->foreign('role_id', 'role_id_fk_10571214')
                ->references('id')->on('roles')
                ->onDelete('cascade');

            $table->primary(['user_id', 'role_id']);
        });
    }

   /* public function down()
    {
        Schema::dropIfExists('role_user');
    } */
}

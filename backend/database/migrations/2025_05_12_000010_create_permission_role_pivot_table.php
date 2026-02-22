<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePermissionRolePivotTable extends Migration
{
    public function up()
    {
        Schema::create('permission_role', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('permission_id');

            $table->foreign('role_id', 'role_id_fk_10571205')
                ->references('id')->on('roles')
                ->onDelete('cascade');

            $table->foreign('permission_id', 'permission_id_fk_10571205')
                ->references('id')->on('permissions')
                ->onDelete('cascade');

            $table->primary(['role_id', 'permission_id']);
        });
    }

    /* public function down()
    {
        Schema::dropIfExists('permission_role');
    } */
}

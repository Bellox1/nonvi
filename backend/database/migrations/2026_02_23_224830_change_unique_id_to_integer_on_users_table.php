<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, clear the string values to avoid type conversion error
        DB::table('users')->update(['unique_id' => null]);

        Schema::table('users', function (Blueprint $table) {
            $table->integer('unique_id')->nullable()->change();
        });

        // Regenerate unique_id as 8-digit integers for existing users
        User::all()->each(function ($user) {
            do {
                $uniqueId = rand(10000000, 99999999);
            } while (User::where('unique_id', $uniqueId)->exists());
            
            $user->update(['unique_id' => $uniqueId]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('unique_id', 8)->nullable()->change();
        });
    }
};

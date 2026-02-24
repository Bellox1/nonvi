<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('unique_id', 8)->nullable()->unique()->after('id');
        });

        // Generate unique_id for existing users
        User::all()->each(function ($user) {
            do {
                $uniqueId = strtoupper(Str::random(8));
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
            $table->dropColumn('unique_id');
        });
    }
};

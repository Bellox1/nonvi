<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwilioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    protected $twilio;

    public function __construct(TwilioService $twilio)
    {
        $this->twilio = $twilio;
    }
    public function sendOtp(Request $request)
    {
        $request->validate([
            'tel' => 'required|string|max:20',
            'type' => 'required|in:sms,whatsapp'
        ]);

        $otp = rand(1000, 9999);
        $message = "Votre code de vérification Nonvi Voyage Plus est : $otp";

        // We can either find the user or just store it temporarily if it's for registration
        // For now, let's find or create a placeholder or just store in cache. 
        // But the user model has verification_code, so we use it.
        $user = User::where('tel', $request->tel)->first();
        
        if (!$user) {
            // Create a "pending" user or just an entry? 
            // Let's create a temporary user if it doesn't exist, or just use Cache.
            // Using Cache is cleaner for OTPs.
            \Cache::put('otp_' . $request->tel, $otp, now()->addMinutes(10));
        } else {
            $user->update(['verification_code' => $otp]);
        }

        \Log::info("Tentative d'envoi OTP [$otp] vers : " . $request->tel . " via " . $request->type);

        if ($request->type === 'whatsapp') {
            $this->twilio->sendWhatsApp($request->tel, $message);
        } else {
            $this->twilio->sendSMS($request->tel, $message);
        }

        \Log::info("OTP envoyé (ou tenté) pour : " . $request->tel);
        return response()->json(['message' => 'OTP envoyé avec succès']);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'tel' => 'required|string|max:20|unique:users,tel',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'otp' => 'required|string|size:4'
        ]);

        $cachedOtp = \Cache::get('otp_' . $request->tel);
        
        if ($cachedOtp != $request->otp) {
            throw ValidationException::withMessages(['otp' => 'Code OTP invalide']);
        }

        return DB::transaction(function () use ($request) {
            // 1. Create User for Authentication
            $user = User::create([
                'name' => $request->name,
                'tel' => $request->tel,
                'password' => Hash::make($request->password),
                'phone_verified_at' => now(),
            ]);

            \Cache::forget('otp_' . $request->tel);

            // No role assigned for regular clients (mobile users)
            // Administrative staff roles are managed by the admin panel.

            return response()->json([
                'token' => $user->createToken('auth_token')->plainTextToken,
                'user' => $user->load('roles.permissions'),
            ]);
        });
    }

    public function login(Request $request)
    {
        $request->validate([
            'tel' => 'required|string',
            'password' => 'required',
        ]);

        $user = User::where('tel', $request->tel)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'tel' => [__('api.auth.login_failed')],
            ]);
        }

        return response()->json([
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user' => $user->load('roles.permissions'),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => __('api.auth.logout_success')]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('roles.permissions'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'tel' => 'required|string|max:20|unique:users,tel,' . $user->id,
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'otp' => 'required|string|size:4'
        ]);

        if (!$this->verifyOtp($request->tel, $request->otp)) {
            throw ValidationException::withMessages(['otp' => 'Code de vérification invalide.']);
        }

        return DB::transaction(function () use ($request, $user) {
            $user->name = $request->name;
            $user->tel = $request->tel;
            
            if ($request->email) {
                $user->email = $request->email;
            }

            if ($request->password) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            return response()->json([
                'message' => __('api.auth.profile_updated'),
                'user' => $user->load('roles')
            ]);
        });
    }

    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        return response()->json(['message' => 'Mot de passe correct']);
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
            'otp' => 'required|string|size:4'
        ]);

        $user = $request->user();

        if (!$this->verifyOtp($user->tel, $request->otp)) {
            throw ValidationException::withMessages(['otp' => 'Code de vérification invalide.']);
        }

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Le mot de passe est incorrect.'],
            ]);
        }

        return DB::transaction(function () use ($user) {
            // Delete User (Soft Delete by default based on model)
            $user->delete();

            return response()->json([
                'message' => 'Compte supprimé avec succès.'
            ]);
        });
    }

    public function checkUser(Request $request)
    {
        $request->validate([
            'tel' => 'required|string|max:20',
        ]);

        $exists = User::where('tel', $request->tel)->exists();

        if (!$exists) {
            return response()->json([
                'message' => 'Ce numéro de téléphone n\'est pas enregistré sur Nonvi Voyage.',
                'exists' => false
            ], 404);
        }

        return response()->json([
            'message' => 'Utilisateur trouvé.',
            'exists' => true
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'tel' => 'required|string|max:20|exists:users,tel',
            'type' => 'required|in:sms,whatsapp'
        ], [
            'tel.exists' => 'Ce numéro de téléphone n\'est pas enregistré.'
        ]);

        $otp = rand(1000, 9999);
        $message = "Votre code de réinitialisation Nonvi Voyage Plus est : $otp";

        $user = User::where('tel', $request->tel)->first();
        $user->update(['verification_code' => $otp]);
        
        // Cache as backup
        \Cache::put('otp_reset_' . $request->tel, $otp, now()->addMinutes(10));

        \Log::info("Reset Password OTP vers : " . $request->tel . " via " . $request->type);

        if ($request->type === 'whatsapp') {
            $this->twilio->sendWhatsApp($request->tel, $message);
        } else {
            $this->twilio->sendSMS($request->tel, $message);
        }

        return response()->json(['message' => 'OTP envoyé avec succès']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'tel' => 'required|string|max:20|exists:users,tel',
            'otp' => 'required|string|size:4',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = User::where('tel', $request->tel)->first();
        $cachedOtp = \Cache::get('otp_reset_' . $request->tel);

        if ($user->verification_code != $request->otp && $cachedOtp != $request->otp) {
            throw ValidationException::withMessages(['otp' => 'Code OTP invalide']);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'verification_code' => null
        ]);

        \Cache::forget('otp_reset_' . $request->tel);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }
    private function verifyOtp($tel, $otp)
    {
        // 1. Check in Cache (used for registration or if user not found during sendOtp)
        $cachedOtp = \Cache::get('otp_' . $tel);
        if ($cachedOtp && $cachedOtp == $otp) {
            \Cache::forget('otp_' . $tel);
            return true;
        }

        // 2. Check in User model (used for existing users)
        $user = User::where('tel', $tel)->first();
        if ($user && $user->verification_code && $user->verification_code == $otp) {
            $user->update(['verification_code' => null]);
            return true;
        }

        return false;
    }
}

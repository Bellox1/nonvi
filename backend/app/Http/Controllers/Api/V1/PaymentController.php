<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Commande;
use App\Models\Ticket;
use App\Models\PendingPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use FedaPay\FedaPay;
use FedaPay\Transaction;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;

class PaymentController extends Controller
{
    public function __construct()
    {
        FedaPay::setApiKey(env('FEDAPAY_SECRET_KEY'));
        $isSandbox = filter_var(env('FEDAPAY_SANDBOX', true), FILTER_VALIDATE_BOOLEAN);
        FedaPay::setEnvironment($isSandbox ? 'sandbox' : 'live');
    }

    public function createTransaction(Request $request)
    {
        \Log::info('Payment initiation request', $request->all());
        $request->validate([
            'type' => 'required|in:reservation,commande',
            'id' => 'required|integer',
        ]);

        $model = $request->type === 'reservation' ? Reservation::findOrFail($request->id) : Commande::findOrFail($request->id);
        
        // Ensure user owns the item
        if ($model->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $amount = $request->type === 'reservation' ? $model->prix : $model->prix_total;
        $description = $request->type === 'reservation' ? "Paiement Réservation #{$model->id}" : "Paiement Commande #{$model->id}";

        try {
            $transaction = Transaction::create([
                "description" => $description,
                "amount" => (int) $amount,
                "currency" => ["iso" => "XOF"],
                "callback_url" => route('api.payment.callback', ['type' => $request->type, 'id' => $model->id]),
                "customer" => [
                    "firstname" => auth()->user()->name,
                    "email" => auth()->user()->email ?? 'customer@nonviplus.com',
                ]
            ]);

            $token = $transaction->generateToken();

            $model->update(['payment_id' => $transaction->id]);

            return response()->json([
                'checkout_url' => $token->url,
                'transaction_id' => $transaction->id
            ]);
        } catch (\Exception $e) {
            \Log::error('FedaPay Transaction Creation Error: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            return response()->json(['message' => 'FedaPay Error: ' . $e->getMessage()], 500);
        }
    }

    public function directPay(Request $request)
    {
        $request->validate([
            'payment_id' => 'required',
            'phone' => 'required',
            'operator' => 'required|in:mtn,moov,mtn_ci,moov_ci',
        ]);

        try {
            $transaction = Transaction::retrieve($request->payment_id);
            
            $transaction->sendNow($request->operator, [
                'phone_number' => [
                    'number' => $request->phone,
                    'country' => 'bj'
                ]
            ]);

            return response()->json([
                'message' => 'Demande de paiement envoyée. Veuillez valider sur votre téléphone.',
                'status' => 'pending'
            ]);
        } catch (\FedaPay\Error\Base $e) {
            \Log::error('FedaPay SDK Error: ' . $e->getMessage(), [
                'httpStatus' => $e->getHttpStatus(),
                'httpBody' => $e->getHttpBody(),
                'jsonBody' => $e->getJsonBody(),
                'payment_id' => $request->payment_id
            ]);
            return response()->json(['message' => 'FedaPay Error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            \Log::error('Direct Pay General Error: ' . $e->getMessage(), [
                'payment_id' => $request->payment_id,
                'exception' => $e
            ]);
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    public function callback(Request $request, $type, $id)
    {
        // FedaPay appends 'id' (transaction_id) to the callback URL
        $transactionId = $request->id;
        $status = $request->status;

        if ($status === 'approved' && $transactionId) {
            $pending = PendingPayment::where('payment_id', $transactionId)->first();
            
            if ($pending) {
                $data = $pending->data;
                $user_id = $pending->user_id;

                if ($type === 'reservation') {
                    $reservation = Reservation::create([
                        'user_id' => $user_id,
                        'station_depart_id' => $data['station_depart_id'],
                        'station_arrivee_id' => $data['station_arrivee_id'],
                        'nombre_tickets' => $data['nombre_tickets'],
                        'date_depart' => $data['date_depart'],
                        'heure_depart' => $data['heure_depart'],
                        'moyen_paiement' => $data['moyen_paiement'] ?? 'FedaPay',
                        'statut' => 'confirme',
                        'prix' => $data['prix'],
                        'payment_status' => 'paid',
                        'payment_id' => $transactionId
                    ]);

                    // Generate tickets
                    for ($i = 0; $i < $data['nombre_tickets']; $i++) {
                        $code = strtoupper(Str::random(8));
                        while (Ticket::where('code', $code)->exists()) {
                            $code = strtoupper(Str::random(8));
                        }
                        $ticket = $reservation->tickets()->create([
                            'code' => $code,
                            'is_scanned' => false,
                        ]);

                        // Generate QR Code Image
                        $this->generateTicketQrCode($user_id, $ticket);
                    }
                } elseif ($type === 'commande') {
                    $items_data = $data['items'];
                    $commande = Commande::create([
                        'user_id' => $user_id,
                        'produit_id' => count($items_data) === 1 ? $items_data[0]['produit_id'] : null,
                        'quantite' => count($items_data) === 1 ? $items_data[0]['quantite'] : null,
                        'prix_total' => $data['prix_total'],
                        'type_retrait' => $data['type_retrait'],
                        'ville_livraison' => $data['ville_livraison'],
                        'statut' => 'paye',
                        'payment_status' => 'paid',
                        'payment_id' => $transactionId
                    ]);

                    foreach ($items_data as $item) {
                        $commande->items()->create($item);
                    }
                }

                // Delete pending once processed
                $pending->delete();
            }
        }

        // Redirection immédiate vers l'app pour fermer le navigateur
        if ($request->isMethod('get')) {
            return redirect("nonvi://payment-finished");
        }

        return response()->json(['message' => 'Callback processed']);
    }

    private function generateTicketQrCode($userId, $ticket)
    {
        $dir = "qrcodes/{$userId}";
        $path = storage_path("app/public/{$dir}/ticket_{$ticket->code}.png");

        if (!file_exists(storage_path("app/public/{$dir}"))) {
            mkdir(storage_path("app/public/{$dir}"), 0755, true);
        }

        $qrData = "NVT_SECURE_v1:" . base64_encode("NV_HASH_92_" . $ticket->code . "_31_NONVI");

        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($qrData)
            ->size(300)
            ->margin(10)
            ->build();

        $result->saveToFile($path);
    }

    /**
     * Webhook handler for FedaPay (more secure)
     */
    public function webhook(Request $request)
    {
        // To be implemented for production
        // Verify signature and update status based on event type
    }
}

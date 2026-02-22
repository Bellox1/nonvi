<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class TwilioService
{
    protected $client;
    protected $from;
    protected $whatsappFrom;

    public function __construct()
    {
        $sid = env('TWILIO_SID');
        $token = env('TWILIO_AUTH_TOKEN');
        $this->from = env('TWILIO_PHONE_NUMBER');
        $this->whatsappFrom = "whatsapp:" . env('TWILIO_WHATSAPP_NUMBER');
        $this->client = new Client($sid, $token);
    }

    /**
     * Send SMS
     */
    public function sendSMS($to, $message)
    {
        try {
            Log::info("Twilio SMS sending to: $to from: {$this->from}");
            $response = $this->client->messages->create($to, [
                'from' => $this->from,
                'body' => $message
            ]);
            Log::info("Twilio SMS sent successfully. SID: " . $response->sid);
            return $response;
        } catch (\Exception $e) {
            Log::error("Twilio SMS Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send WhatsApp
     */
    public function sendWhatsApp($to, $message)
    {
        try {
            // Check if $to already has whatsapp: prefix
            $to = strpos($to, 'whatsapp:') === 0 ? $to : "whatsapp:" . $to;
            
            Log::info("Twilio WhatsApp sending to: $to from: {$this->whatsappFrom}");
            $response = $this->client->messages->create($to, [
                'from' => $this->whatsappFrom,
                'body' => $message
            ]);
            Log::info("Twilio WhatsApp sent successfully. SID: " . $response->sid);
            return $response;
        } catch (\Exception $e) {
            Log::error("Twilio WhatsApp Error: " . $e->getMessage());
            return false;
        }
    }
}

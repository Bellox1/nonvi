<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use App\Models\Ticket;
use Illuminate\Support\Str;

class FixTickets extends Command
{
    protected $signature = 'tickets:fix {--dry-run : Do not write, only report what would change} {--reservation-id= : Only fix one reservation id}';

    protected $description = 'Generate missing tickets for reservations (unique codes, is_scanned=false)';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $reservationId = $this->option('reservation-id');

        $query = Reservation::query()->withCount('tickets');
        if ($reservationId) {
            $query->where('id', $reservationId);
        }

        $reservations = $query->get();

        $totalReservations = 0;
        $totalTicketsToCreate = 0;
        $totalTicketsCreated = 0;

        foreach ($reservations as $reservation) {
            $expected = (int) ($reservation->nombre_tickets ?? 0);
            $existing = (int) ($reservation->tickets_count ?? 0);

            if ($expected <= 0) {
                continue;
            }

            if ($existing >= $expected) {
                continue;
            }

            $missing = $expected - $existing;
            $totalReservations++;
            $totalTicketsToCreate += $missing;

            $this->line("Reservation #{$reservation->id}: expected={$expected}, existing={$existing}, missing={$missing}");

            if ($dryRun) {
                continue;
            }

            for ($i = 0; $i < $missing; $i++) {
                $code = strtoupper(Str::random(8));
                while (Ticket::where('code', $code)->exists()) {
                    $code = strtoupper(Str::random(8));
                }

                Ticket::create([
                    'reservation_id' => $reservation->id,
                    'code' => $code,
                    'is_scanned' => false,
                ]);

                $totalTicketsCreated++;
            }
        }

        if ($totalReservations === 0) {
            $this->info('Nothing to fix.');
            return self::SUCCESS;
        }

        if ($dryRun) {
            $this->info("Dry-run: {$totalReservations} reservation(s) would be fixed, {$totalTicketsToCreate} ticket(s) would be created.");
            return self::SUCCESS;
        }

        $this->info("Done: {$totalReservations} reservation(s) fixed, {$totalTicketsCreated} ticket(s) created.");
        return self::SUCCESS;
    }
}

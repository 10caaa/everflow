<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\EverflowService;
use App\Http\Requests\StatsRequest;
use Carbon\Carbon;

class ProfitController extends Controller
{
    private EverflowService $everflowService;

    public function __construct(EverflowService $everflowService)
    {
        $this->everflowService = $everflowService;
    }

    public function getOfferStats(StatsRequest $request)
    {
        try {
            $data = $this->everflowService->getOfferStats(
                $request->start_date,
                $request->end_date
            );

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des stats offers: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des données',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getAffiliateStats(StatsRequest $request)
    {
        try {
            $data = $this->everflowService->getAffiliateStats(
                $request->start_date,
                $request->end_date
            );

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des stats affiliates: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des données',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getAdvertiserStats(StatsRequest $request)
    {
        try {
            $data = $this->everflowService->getAdvertiserStats(
                $request->start_date,
                $request->end_date
            );

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des stats advertisers: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des données',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

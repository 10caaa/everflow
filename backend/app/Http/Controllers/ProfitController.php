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

    public function getDashboardStats(StatsRequest $request)
    {
        try {
            // Récupérer les données pour les 3 types
            $offersData = $this->everflowService->getOfferStats(
                $request->start_date,
                $request->end_date
            );
            
            $affiliatesData = $this->everflowService->getAffiliateStats(
                $request->start_date,
                $request->end_date
            );
            
            $advertisersData = $this->everflowService->getAdvertiserStats(
                $request->start_date,
                $request->end_date
            );

            // Calculer les totaux globaux
            $totalProfit = 0;
            $totalClicks = 0;
            $totalConversions = 0;
            $totalRevenue = 0;

            // Agréger les données des offres
            if (isset($offersData['data']) && is_array($offersData['data'])) {
                foreach ($offersData['data'] as $offer) {
                    $totalProfit += $offer['profit'] ?? 0;
                    $totalClicks += $offer['clicks'] ?? 0;
                    $totalConversions += $offer['conversions'] ?? 0;
                    $totalRevenue += $offer['revenue'] ?? 0;
                }
            }

            // Calculer le taux de conversion global
            $conversionRate = $totalClicks > 0 ? round(($totalConversions / $totalClicks) * 100, 2) : 0;

            // Top 5 des offres par profit
            $topOffers = [];
            if (isset($offersData['data']) && is_array($offersData['data'])) {
                $topOffers = collect($offersData['data'])
                    ->sortByDesc('profit')
                    ->take(5)
                    ->values()
                    ->toArray();
            }

            // Top 5 des affiliés par profit
            $topAffiliates = [];
            if (isset($affiliatesData['data']) && is_array($affiliatesData['data'])) {
                $topAffiliates = collect($affiliatesData['data'])
                    ->sortByDesc('profit')
                    ->take(5)
                    ->values()
                    ->toArray();
            }

            // Top 5 des annonceurs par profit
            $topAdvertisers = [];
            if (isset($advertisersData['data']) && is_array($advertisersData['data'])) {
                $topAdvertisers = collect($advertisersData['data'])
                    ->sortByDesc('profit')
                    ->take(5)
                    ->values()
                    ->toArray();
            }

            return response()->json([
                'success' => true,
                'period' => [
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date
                ],
                'summary' => [
                    'total_profit' => round($totalProfit, 2),
                    'total_clicks' => $totalClicks,
                    'total_conversions' => $totalConversions,
                    'total_revenue' => round($totalRevenue, 2),
                    'conversion_rate' => $conversionRate
                ],
                'top_performers' => [
                    'offers' => $topOffers,
                    'affiliates' => $topAffiliates,
                    'advertisers' => $topAdvertisers
                ],
                'data_sources' => [
                    'offers' => $offersData['data_source'] ?? 'Unknown',
                    'affiliates' => $affiliatesData['data_source'] ?? 'Unknown',
                    'advertisers' => $advertisersData['data_source'] ?? 'Unknown'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des stats dashboard: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la récupération des données dashboard',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

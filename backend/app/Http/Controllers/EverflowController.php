<?php

namespace App\Http\Controllers;

use App\Services\EverflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EverflowController extends Controller
{
    private EverflowService $everflowService;

    public function __construct(EverflowService $everflowService)
    {
        $this->everflowService = $everflowService;
    }

    public function getOffers(Request $request)
    {
        try {
            $filters = $request->only(['status', 'limit', 'page']);
            $data = $this->everflowService->getOffers($filters);

            if (isset($data['error'])) {
                return response()->json($data, $data['status'] ?? 500);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur récupération offres: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => 'Erreur lors de la récupération des offres'
            ], 500);
        }
    }

    public function getAffiliates(Request $request)
    {
        try {
            $filters = $request->only(['status', 'limit', 'page']);
            $data = $this->everflowService->getAffiliates($filters);

            if (isset($data['error'])) {
                return response()->json($data, $data['status'] ?? 500);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur récupération affiliés: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => 'Erreur lors de la récupération des affiliés'
            ], 500);
        }
    }

    public function getAffiliateTiers()
    {
        try {
            $data = $this->everflowService->getAffiliateTiers();

            if (isset($data['error'])) {
                return response()->json($data, $data['status'] ?? 500);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur récupération tiers affiliés: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => 'Erreur lors de la récupération des tiers'
            ], 500);
        }
    }

    public function getAdvertisers(Request $request)
    {
        try {
            $filters = $request->only(['status', 'limit', 'page']);
            $data = $this->everflowService->getAdvertisers($filters);

            if (isset($data['error'])) {
                return response()->json($data, $data['status'] ?? 500);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur récupération annonceurs: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => 'Erreur lors de la récupération des annonceurs'
            ], 500);
        }
    }

    public function getAdvertiser($id)
    {
        try {
            $data = $this->everflowService->getAdvertiser($id);

            if (isset($data['error'])) {
                return response()->json($data, $data['status'] ?? 500);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur récupération annonceur: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => 'Erreur lors de la récupération de l\'annonceur'
            ], 500);
        }
    }

    public function getDashboard()
    {
        try {
            $data = $this->everflowService->getAffiliateDashboard();

            if (isset($data['error'])) {
                return response()->json($data, $data['status'] ?? 500);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Erreur récupération dashboard: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => 'Erreur lors de la récupération du dashboard'
            ], 500);
        }
    }

    public function testConnection()
    {
        try {
            $result = $this->everflowService->testConnection();
            
            $statusCode = $result['success'] ? 200 : 503;
            return response()->json($result, $statusCode);
        } catch (\Exception $e) {
            Log::error('Erreur test connexion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du test de connexion'
            ], 500);
        }
    }
}
<?php

namespace App\Http\Controllers;

use App\Services\EverflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DebugController extends Controller
{
    public function debugEverflow()
    {
        Log::info('Debug Everflow config called');
        
        return response()->json([
            'env_values' => [
                'EVERFLOW_API_URL' => env('EVERFLOW_API_URL'),
                'EVERFLOW_API_KEY' => env('EVERFLOW_API_KEY') ? substr(env('EVERFLOW_API_KEY'), 0, 4) . '...' : 'NULL',
                'EVERFLOW_API_KEY_empty' => empty(env('EVERFLOW_API_KEY')),
            ],
            'config_everflow' => [
                'api_url' => config('everflow.api_url'),
                'api_key' => config('everflow.api_key') ? substr(config('everflow.api_key'), 0, 4) . '...' : 'NULL',
                'api_key_empty' => empty(config('everflow.api_key')),
            ],
            'config_services' => [
                'api_url' => config('services.everflow.api_url'),
                'api_key' => config('services.everflow.api_key') ? substr(config('services.everflow.api_key'), 0, 4) . '...' : 'NULL',
                'api_key_empty' => empty(config('services.everflow.api_key')),
            ]
        ]);
    }
    
    public function testEverflowCall()
    {
        $service = new EverflowService();
        
        // Test avec une requête simple
        $result = $service->getOfferStats('2024-01-01', '2024-01-31');
        
        return response()->json([
            'result' => $result,
            'has_data' => !empty($result['data']),
            'data_count' => count($result['data'] ?? [])
        ]);
    }
}
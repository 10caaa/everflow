<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EverflowService
{
    private string $apiUrl;
    private ?string $apiKey;
    private int $timezoneId;
    private string $currencyId;
    private int $timeout;

    public function __construct()
    {
        $this->apiUrl = rtrim(config('everflow.api_url', config('services.everflow.api_url', 'https://api.eflow.team/v1')), '/');
        $this->apiKey = config('everflow.api_key', config('services.everflow.api_key'));
        $this->timezoneId = (int) config('everflow.timezone_id', 67);
        $this->currencyId = (string) config('everflow.currency_id', 'USD');
        $this->timeout = (int) config('everflow.timeout', 20);
        
        // Debug: vérifier quelle clé API est utilisée
        Log::info('EverflowService initialized', [
            'api_url' => $this->apiUrl,
            'api_key_empty' => empty($this->apiKey),
            'api_key_length' => $this->apiKey ? strlen($this->apiKey) : 0,
            'api_key_first_4' => $this->apiKey ? substr($this->apiKey, 0, 4) . '...' : 'NULL',
            'config_everflow_api_key' => config('everflow.api_key'),
            'config_services_api_key' => config('services.everflow.api_key'),
            'env_EVERFLOW_API_KEY' => env('EVERFLOW_API_KEY')
        ]);
    }

    public function getOfferStats($startDate, $endDate)
    {
        $url = $this->apiUrl . "/networks/reporting/entity/table";

        $payload = $this->buildTablePayload($startDate, $endDate, ['offer', 'affiliate']);

        $response = $this->callApi($url, $payload);

        return $this->parseStatsResponse($response);
    }

    public function getAffiliateStats($startDate, $endDate)
    {
        $url = $this->apiUrl . "/networks/reporting/entity/table";

        $payload = $this->buildTablePayload($startDate, $endDate, ['affiliate', 'offer']);

        $response = $this->callApi($url, $payload);
        return $this->parseStatsResponse($response);
    }

    public function getAdvertiserStats($startDate, $endDate)
    {
        $url = $this->apiUrl . "/networks/reporting/entity/table";
        $payload = $this->buildTablePayload($startDate, $endDate, ['advertiser', 'offer']);
        $response = $this->callApi($url, $payload);
        return $this->parseStatsResponse($response);
    }

    public function getConversions($startDate, $endDate)
    {
        $url = $this->apiUrl . "/networks/reporting/conversions";

        $payload = [
            "from" => $startDate,
            "to" => $endDate,
            "timezone_id" => $this->timezoneId,
            "show_conversions" => true,
            "show_events" => false,
            "query" => [
                "filters" => []
            ]
        ];

        $response = $this->callApi($url, $payload);
        return $response['data'] ?? $response;
    }

    public function getAffiliateDashboard()
    {
        $url = $this->apiUrl . "/affiliates/dashboard/summary";

        $payload = [
            "timezone_id" => $this->timezoneId
        ];

        $response = $this->callApi($url, $payload);
        return $response['data'] ?? $response;
    }

    public function testConnection()
    {
        $url = $this->apiUrl . "/networks";
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Eflow-API-Key' => $this->apiKey,
        ])->timeout($this->timeout)->get($url);

        if ($response->successful()) {
            return [
                'success' => true,
                'message' => 'Connexion Everflow réussie',
                'data' => $response->json()
            ];
        }

        return [
            'success' => false,
            'message' => 'Échec connexion Everflow'
        ];
    }

    public function getOffers(array $filters = [])
    {
        $url = $this->apiUrl . "/networks/offers";
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Eflow-API-Key' => $this->apiKey,
        ])->timeout($this->timeout)->get($url, $filters);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'error' => true,
            'message' => 'Erreur récupération offres',
            'status' => $response->status()
        ];
    }

    public function getAffiliates(array $filters = [])
    {
        $url = $this->apiUrl . "/networks/affiliates";
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Eflow-API-Key' => $this->apiKey,
        ])->timeout($this->timeout)->get($url, $filters);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'error' => true,
            'message' => 'Erreur récupération affiliés',
            'status' => $response->status()
        ];
    }

    public function getAffiliateTiers()
    {
        $url = $this->apiUrl . "/networks/affiliate_tiers";
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Eflow-API-Key' => $this->apiKey,
        ])->timeout($this->timeout)->get($url);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'error' => true,
            'message' => 'Erreur récupération tiers affiliés',
            'status' => $response->status()
        ];
    }

    public function getAdvertisers(array $filters = [])
    {
        $url = $this->apiUrl . "/networks/advertisers";
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Eflow-API-Key' => $this->apiKey,
        ])->timeout($this->timeout)->get($url, $filters);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'error' => true,
            'message' => 'Erreur récupération annonceurs',
            'status' => $response->status()
        ];
    }

    public function getAdvertiser($advertiserId)
    {
        $url = $this->apiUrl . "/networks/advertisers/{$advertiserId}";
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Eflow-API-Key' => $this->apiKey,
        ])->timeout($this->timeout)->get($url);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'error' => true,
            'message' => 'Erreur récupération annonceur',
            'status' => $response->status()
        ];
    }

    private function callApi($url, $payload)
    {
        if (empty($this->apiKey)) {
            return [
                'error' => true,
                'status' => 500,
                'message' => 'EVERFLOW_API_KEY manquant. Ajoutez-le dans .env',
            ];
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Eflow-API-Key' => $this->apiKey,
        ])->timeout($this->timeout)->post($url, $payload);

        if ($response->failed()) {
            return [
                'error' => true,
                'status' => $response->status(),
                'message' => $response->body()
            ];
        }

        return $response->json();
    }

    private function buildTablePayload(string $startDate, string $endDate, array $columns, array $filters = []): array
    {
        return [
            'from' => $startDate,
            'to' => $endDate,
            'timezone_id' => $this->timezoneId,
            'currency_id' => $this->currencyId,
            'columns' => array_map(fn ($c) => ['column' => $c], $columns),
            'query' => [
                'filters' => $filters,
            ],
        ];
    }

    private function parseStatsResponse($data)
    {
        try {
            Log::info('Everflow raw response', ['response' => $data]);

            if (isset($data['table']) && is_array($data['table'])) {
                Log::info('Structure table détectée', ['table_count' => count($data['table'])]);
                $table = $data['table'];

                $results = [];
                foreach ($table as $rowIndex => $row) {
                    try {
                        if (isset($row['columns']) && isset($row['reporting'])) {
                            $offerInfo = null;
                            $affiliateInfo = null;
                            $advertiserInfo = null;
                            
                            foreach ($row['columns'] as $col) {
                                if ($col['column_type'] === 'offer') {
                                    $offerInfo = $col;
                                } elseif ($col['column_type'] === 'affiliate') {
                                    $affiliateInfo = $col;
                                } elseif ($col['column_type'] === 'advertiser') {
                                    $advertiserInfo = $col;
                                }
                            }
                            
                            $reporting = $row['reporting'];
                            
                            $clicks = (int) ($reporting['total_click'] ?? 0);
                            $conversions = (int) ($reporting['total_cv'] ?? 0);
                            $revenue = (float) ($reporting['revenue'] ?? 0);
                            $payout = (float) ($reporting['payout'] ?? 0);
                            
                            $results[] = [
                                'id' => $offerInfo['id'] ?? $affiliateInfo['id'] ?? $advertiserInfo['id'] ?? ('row_' . $rowIndex),
                                'offer' => $offerInfo['label'] ?? 'Offre inconnue',
                                'affiliate' => $affiliateInfo['label'] ?? null,
                                'advertiser' => $advertiserInfo['label'] ?? null,
                                'name' => $affiliateInfo['label'] ?? $advertiserInfo['label'] ?? ($offerInfo['label'] ?? 'Inconnu'),
                                'clicks' => $clicks,
                                'conversions' => $conversions,
                                'revenue' => $revenue,
                                'payout' => $payout,
                                'profit' => $revenue - $payout,
                                'conversion_rate' => $clicks > 0 ? round(($conversions / $clicks) * 100, 2) : 0,
                            ];
                        } elseif (is_array($row) && count($row) > 0 && !isset($row['columns'])) {
                            if ($rowIndex === 0) continue;
                            Log::info('Structure tableau simple détectée', ['row' => $row]);
                        }
                    } catch (\Exception $e) {
                        Log::error('Erreur parsing ligne', ['row' => $row, 'error' => $e->getMessage()]);
                        continue;
                    }
                }

                Log::info('Stats parsées avec succès', ['count' => count($results)]);
                return [
                    'data' => $results,
                    'total_profit' => array_sum(array_column($results, 'profit')),
                    'total_conversions' => array_sum(array_column($results, 'conversions')),
                    'total_clicks' => array_sum(array_column($results, 'clicks')),
                    'count' => count($results),
                    'data_source' => 'Everflow API (table)'
                ];
            }

            if (isset($data['data']['columns']) && isset($data['data']['rows'])) {
                Log::info('Structure columns/rows détectée');
                $columns = array_column($data['data']['columns'], 'name');
                $rows = $data['data']['rows'];
                $results = [];

                foreach ($rows as $row) {
                    $item = array_combine($columns, $row);
                    $results[] = [
                        'id' => $item['offer_id'] ?? $item['affiliate_id'] ?? 'unknown',
                        'offer' => $item['offer_name'] ?? 'Offre inconnue',
                        'name' => $item['affiliate_name'] ?? 'Affilié inconnu',
                        'clicks' => (int) ($item['clicks'] ?? 0),
                        'conversions' => (int) ($item['conversions'] ?? 0),
                        'revenue' => (float) ($item['revenue'] ?? 0),
                        'payout' => (float) ($item['payout'] ?? 0),
                        'profit' => (float) ($item['revenue'] ?? 0) - (float) ($item['payout'] ?? 0),
                    ];
                }

                return [
                    'data' => $results,
                    'count' => count($results),
                    'data_source' => 'Everflow API (columns/rows)'
                ];
            }

            if (isset($data['data']) && is_array($data['data'])) {
                Log::info('Structure data simple détectée');
                return [
                    'data' => $data['data'],
                    'count' => count($data['data']),
                    'data_source' => 'Everflow API (data simple)'
                ];
            }

            Log::warning('Format Everflow non reconnu', ['data' => $data]);
            return [
                'error' => true,
                'message' => 'Format Everflow non reconnu',
                'raw' => $data
            ];

        } catch (\Exception $e) {
            Log::error("Erreur parse Everflow: " . $e->getMessage());
            return [
                'error' => true,
                'message' => 'Erreur parsing: ' . $e->getMessage(),
                'raw' => $data
            ];
        }
    }
}
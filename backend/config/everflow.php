<?php

return [
    // Base URL (include version path if required)
    'api_url' => env('EVERFLOW_API_URL', 'https://api.eflow.team/v1'),

    // API key will be provided by the user
    'api_key' => env('EVERFLOW_API_KEY'),

    // Default timezone and currency IDs used in requests
    'timezone_id' => env('EVERFLOW_TIMEZONE_ID', 67), // 67 = UTC typically
    'currency_id' => env('EVERFLOW_CURRENCY_ID', 'USD'),

    // Optional HTTP timeout (seconds)
    'timeout' => env('EVERFLOW_TIMEOUT', 20),
];

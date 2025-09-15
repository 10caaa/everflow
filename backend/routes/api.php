<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfitController;
use App\Http\Controllers\EverflowController;
use App\Http\Controllers\DebugController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Debug routes (public pour faciliter les tests)
Route::get('/debug/everflow', [DebugController::class, 'debugEverflow']);
Route::get('/debug/everflow/test', [DebugController::class, 'testEverflowCall']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Stats endpoints (existing)
    Route::get('/profits/offers', [ProfitController::class, 'getOfferStats']);
    Route::get('/profits/affiliates', [ProfitController::class, 'getAffiliateStats']);
    Route::get('/profits/advertisers', [ProfitController::class, 'getAdvertiserStats']);
    Route::get('/dashboard/stats', [ProfitController::class, 'getDashboardStats']);
    
    // New Everflow endpoints
    Route::get('/offers', [EverflowController::class, 'getOffers']);
    Route::get('/affiliates', [EverflowController::class, 'getAffiliates']);
    Route::get('/affiliates/tiers', [EverflowController::class, 'getAffiliateTiers']);
    Route::get('/advertisers', [EverflowController::class, 'getAdvertisers']);
    Route::get('/advertisers/{id}', [EverflowController::class, 'getAdvertiser']);
    Route::get('/dashboard', [EverflowController::class, 'getDashboard']);
    Route::get('/everflow/test', [EverflowController::class, 'testConnection']);
});

import { useState } from 'react';
import { authService, profitService, testService } from '../services/api';

const TestConnection: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data?: any, error?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, {
      timestamp,
      test,
      success,
      data,
      error: error?.message || error?.response?.data || error
    }]);
  };

  const testAuth = async () => {
    setLoading(true);
    
    try {
      // Test 0: Test basique de connexion backend
      addResult("🔄 Test de connexion backend...", true);
      
      const connectionTest = await testService.testConnection();
      addResult("✅ Backend accessible", true, {
        server: connectionTest.server,
        timestamp: connectionTest.timestamp,
        status: connectionTest.status
      });
      
      // Test 1: Connexion avec création automatique d'utilisateur
      addResult("🔄 Tentative de connexion utilisateur...", true);
      
      const response = await authService.login({
        email: 'test@everflow.com',
        password: 'password123'
      });
      
      addResult("✅ Connexion réussie", true, {
        user: response.user.name,
        email: response.user.email,
        token_type: response.token_type
      });
      
      // Test 2: Récupération des profits
      addResult("🔄 Récupération des profits...", true);
      
      const profits = await profitService.getProfits();
      
      addResult("✅ Profits récupérés", true, {
        nombre_offres: profits.data.length,
        total_profit: `$${profits.total_profit.toFixed(2)}`,
        total_conversions: profits.total_conversions,
        data_source: profits.data_source || 'API Backend'
      });
      
      // Test 3: Vérification du token
      const currentUser = await authService.getCurrentUserFromApi();
      addResult("✅ Token valide - Utilisateur connecté", true, {
        nom: currentUser.name,
        email: currentUser.email
      });
      
    } catch (error) {
      addResult("❌ Erreur lors du test", false, null, error);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      await authService.logout();
      addResult("✅ Déconnexion réussie", true);
      
      // Vérifier que le token est supprimé
      const isAuth = authService.isAuthenticated();
      addResult(`✅ État authentification: ${isAuth ? 'Connecté' : 'Déconnecté'}`, true);
      
    } catch (error) {
      addResult("❌ Erreur lors de la déconnexion", false, null, error);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Test de Connexion Frontend ↔ Backend
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Configuration actuelle :</h2>
            <ul className="text-blue-700 space-y-1">
              <li>• <strong>Backend:</strong> http://127.0.0.1:8000</li>
              <li>• <strong>Frontend:</strong> http://localhost:5173</li>
              <li>• <strong>API Base:</strong> http://127.0.0.1:8000/api</li>
              <li>• <strong>Auth:</strong> Laravel Sanctum</li>
            </ul>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={async () => {
                try {
                  addResult("🔄 Test backend simple...", true);
                  const result = await testService.testConnection();
                  addResult("✅ Backend OK!", true, result);
                } catch (error) {
                  addResult("❌ Backend inaccessible", false, null, error);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              🧪 Test Backend Simple
            </button>

            <button
              onClick={testAuth}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? '🔄 Test en cours...' : '🚀 Tester Connexion + API'}
            </button>
            
            <button
              onClick={testLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              🚪 Tester Déconnexion
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              🗑️ Vider les résultats
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            <h3 className="text-green-400 font-mono text-sm mb-4">📊 Résultats des tests :</h3>
            
            {results.length === 0 ? (
              <p className="text-gray-400 font-mono text-sm">
                Aucun test lancé. Cliquez sur "Tester Connexion + API" pour commencer.
              </p>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="font-mono text-sm">
                    <div className={`${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      [{result.timestamp}] {result.test}
                    </div>
                    
                    {result.data && (
                      <div className="text-blue-300 ml-4 mt-1">
                        {JSON.stringify(result.data, null, 2)}
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="text-red-300 ml-4 mt-1">
                        Erreur: {JSON.stringify(result.error, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-yellow-800 font-semibold mb-2">🎯 Ce que ce test vérifie :</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>✅ Communication entre frontend React et backend Laravel</li>
              <li>✅ Authentification Sanctum (login automatique si user n'existe pas)</li>
              <li>✅ Génération et validation des tokens Bearer</li>
              <li>✅ Récupération des données de profits depuis l'API</li>
              <li>✅ Gestion des headers et intercepteurs axios</li>
              <li>✅ Déconnexion et suppression des tokens</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;

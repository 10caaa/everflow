const SimpleTest = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', fontSize: '18px' }}>
      <h1 style={{ color: 'green' }}>✅ React fonctionne !</h1>
      <p>Si vous voyez cette page, React est correctement configuré.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Liens de test :</h3>
        <ul>
          <li><a href="/login">🔐 Page de connexion</a></li>
          <li><a href="/test">🧪 Test de connexion API</a></li>
          <li><a href="/dashboard">📊 Dashboard (nécessite connexion)</a></li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleTest;

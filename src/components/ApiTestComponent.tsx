import React, { useState } from 'react';
import axios from 'axios';

interface ApiTestResult {
  success: boolean;
  message?: string;
  response?: string;
  model?: string;
  usage?: any;
  error?: string;
  details?: any;
}

const ApiTestComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiTestResult | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.get('/api/test-openai');
      setResult(response.data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        details: error.response?.data || 'No additional details'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Проверка OpenAI API</h3>
      
      <button 
        onClick={testApiConnection}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '15px'
        }}
      >
        {loading ? 'Проверка...' : 'Проверить соединение'}
      </button>

      {result && (
        <div style={{
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h4 style={{ 
            color: result.success ? '#155724' : '#721c24',
            margin: '0 0 10px 0'
          }}>
            {result.success ? '✅ Соединение успешно!' : '❌ Ошибка соединения'}
          </h4>
          
          {result.success ? (
            <div>
              <p><strong>Сообщение:</strong> {result.message}</p>
              <p><strong>Ответ AI:</strong> {result.response}</p>
              <p><strong>Модель:</strong> {result.model}</p>
              {result.usage && (
                <p><strong>Использование токенов:</strong> {result.usage.total_tokens}</p>
              )}
            </div>
          ) : (
            <div>
              <p><strong>Ошибка:</strong> {result.error}</p>
              {result.details && (
                <details>
                  <summary>Подробности</summary>
                  <pre style={{ 
                    fontSize: '12px', 
                    overflow: 'auto',
                    backgroundColor: '#fff',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
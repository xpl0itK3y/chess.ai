import React, { useState } from 'react';
import axios from 'axios';
import { getAIMove } from '../services/AIService';
import { Board } from '../models/Board';
import { Colors } from '../models/Colors';

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
  const [aiLoading, setAiLoading] = useState(false);
  const [result, setResult] = useState<ApiTestResult | null>(null);
  const [aiResult, setAiResult] = useState<ApiTestResult | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
  ? '/api/test-openai' 
  : 'http://localhost:3000/api/test-openai';
const response = await axios.get(apiUrl);
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

  const testAIMove = async () => {
    setAiLoading(true);
    setAiResult(null);

    try {
      // Создаем тестовую доску
      const testBoard = new Board();
      testBoard.initCells();
      testBoard.addFigures();

      const aiMove = await getAIMove(testBoard, Colors.BLACK);
      
      setAiResult({
        success: aiMove.success,
        message: aiMove.success ? `AI выбрал ход: ${aiMove.from?.x},${aiMove.from?.y} -> ${aiMove.to?.x},${aiMove.to?.y}` : undefined,
        error: aiMove.error,
        response: `От: (${aiMove.from?.x}, ${aiMove.from?.y}) К: (${aiMove.to?.x}, ${aiMove.to?.y})`
      });
    } catch (error: any) {
      setAiResult({
        success: false,
        error: error.message,
        details: 'Test AI move failed'
      });
    } finally {
      setAiLoading(false);
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
      
      <div style={{ marginBottom: '20px' }}>
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
            marginRight: '10px'
          }}
        >
          {loading ? 'Проверка...' : 'Проверить соединение'}
        </button>

        <button 
          onClick={testAIMove}
          disabled={aiLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: aiLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: aiLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {aiLoading ? 'AI думает...' : 'Тест AI хода'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          marginBottom: '15px'
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

      {aiResult && (
        <div style={{
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: aiResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${aiResult.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h4 style={{ 
            color: aiResult.success ? '#155724' : '#721c24',
            margin: '0 0 10px 0'
          }}>
            {aiResult.success ? '🤖 AI ход успешен!' : '❌ Ошибка AI хода'}
          </h4>
          
          {aiResult.success ? (
            <div>
              <p><strong>Сообщение:</strong> {aiResult.message}</p>
              <p><strong>Ход:</strong> {aiResult.response}</p>
            </div>
          ) : (
            <div>
              <p><strong>Ошибка:</strong> {aiResult.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
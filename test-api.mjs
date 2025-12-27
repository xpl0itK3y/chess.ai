// Test API endpoints locally
import axios from 'axios';

const testAPI = async () => {
  console.log('Testing API endpoints...');
  
  const mockBoard = {
    cells: Array(8).fill(null).map((_, y) => 
      Array(8).fill(null).map((_, x) => {
        // Add some black pawns for testing
        if (y === 6) {
          return { x, y, figure: { name: 'Пешка', color: 'BLACK' } };
        }
        return { x, y, figure: null };
      })
    ),
    lostBlackFigures: [],
    lostWhiteFigures: []
  };

  const endpoints = [
    { name: 'Simple AI', url: '/api/simple-ai' },
    { name: 'Smart AI', url: '/api/smart-ai' },
    { name: 'Basic AI', url: '/api/basic-ai' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint.name}...`);
      const response = await axios.post(`http://localhost:3001${endpoint.url}`, {
        board: mockBoard,
        currentColor: 'BLACK'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        }
      });
      
      console.log(`${endpoint.name} SUCCESS:`, response.data);
    } catch (error) {
      console.error(`${endpoint.name} ERROR:`, error.response?.data || error.message);
    }
  }
};

testAPI();
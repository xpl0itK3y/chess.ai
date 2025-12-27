export default async function handler(req, res) {
  // CORS headers
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://chess-ai-xpl0itk3y.vercel.app', 'https://chessai-lac.vercel.app', 'https://your-vercel-app.vercel.app']
    : ['http://localhost:3000'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { board, currentColor } = req.body;
    console.log('Request received:', { currentColor, hasBoard: !!board });

    // Простая AI логика без OpenAI
    const simpleMoves = {
      'BLACK': ['e5', 'd5', 'Nf6', 'Nc6', 'Bc5', 'Bb4', 'g6', 'b6'],
      'WHITE': ['e4', 'd4', 'Nf3', 'Nc3', 'Bc4', 'Bb5', 'g3', 'b3']
    };

    const availableMoves = simpleMoves[currentColor] || [];
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];

    console.log(`Selected move for ${currentColor}: ${randomMove}`);

    return res.status(200).json({
      success: true,
      move: randomMove,
      model: 'simple-ai',
      usage: null,
      message: `Simple AI move for ${currentColor}`
    });

  } catch (error) {
    console.error('Simple AI Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
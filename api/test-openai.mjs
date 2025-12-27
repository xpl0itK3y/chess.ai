import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // CORS headers - ограничим только вашими доменами в проде
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://chess-ai-xpl0itk3y.vercel.app', 'https://chessai-lac.vercel.app', 'https://your-vercel-app.vercel.app', 'http://localhost:3000']
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

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      });
    }

    const openaiClient = new OpenAI({
      apiKey: apiKey,
    });

    // Rate limiting - простая защита от злоупотреблений
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`API request from: ${clientIP}`);
    
    // Test connection with a simple request
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'API connection successful!' in Russian."
        }
      ],
      max_tokens: 10,
    });

    return res.status(200).json({
      success: true,
      message: 'OpenAI API connection successful',
      response: response.choices[0].message.content,
      model: response.model,
      usage: response.usage
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
}
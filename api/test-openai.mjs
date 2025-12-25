const { OpenAI } = require('openai');

const openai = new OpenAI();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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
require('dotenv').config();
const axios = require('axios');

async function testOpenRouter() {
  console.log('Testing OpenRouter API...');
  console.log('API Key length:', process.env.OPENROUTER_API_KEY?.length || 0);
  
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are Luna, a compassionate AI mental health companion."
          },
          {
            role: "user",
            content: "Hello, how are you?"
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Mental Health Companion'
        },
        timeout: 15000
      }
    );

    console.log('✅ SUCCESS! OpenRouter API is working');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('\nFull response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ ERROR: OpenRouter API failed');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.message);
    console.error('Error data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('\n⚠️  API Key issue - Your key might be invalid or expired');
    } else if (error.response?.status === 429) {
      console.error('\n⚠️  Rate limit exceeded - Too many requests');
    } else if (error.response?.status === 402) {
      console.error('\n⚠️  Payment required - Free tier limit reached');
    }
  }
}

testOpenRouter();

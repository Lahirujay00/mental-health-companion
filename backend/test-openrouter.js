require('dotenv').config();
const axios = require('axios');

const modelsToTest = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-2-9b-it:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "qwen/qwen-2-7b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free"
];

async function testModel(model) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: "system",
            content: "You are Luna, a compassionate AI mental health companion."
          },
          {
            role: "user",
            content: "Hi"
          }
        ],
        max_tokens: 50,
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

    return {
      model,
      status: '✅ WORKING',
      response: response.data.choices[0].message.content.substring(0, 80)
    };
    
  } catch (error) {
    return {
      model,
      status: `❌ FAILED (${error.response?.status || error.message})`,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

async function testAllModels() {
  console.log('Testing OpenRouter Free Models...\n');
  console.log('API Key length:', process.env.OPENROUTER_API_KEY?.length || 0);
  console.log('='.repeat(80));
  
  const results = [];
  
  for (const model of modelsToTest) {
    console.log(`\nTesting: ${model}`);
    const result = await testModel(model);
    results.push(result);
    
    if (result.status.includes('WORKING')) {
      console.log(`${result.status}`);
      console.log(`Response: ${result.response}...`);
    } else {
      console.log(`${result.status}`);
      console.log(`Error: ${result.error}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\nSUMMARY - Working Models:');
  console.log('='.repeat(80));
  
  const workingModels = results.filter(r => r.status.includes('WORKING'));
  if (workingModels.length > 0) {
    workingModels.forEach((m, i) => {
      console.log(`${i + 1}. ${m.model}`);
    });
    
    console.log('\n📋 Use this array in your code:');
    console.log('const freeModels = [');
    workingModels.forEach((m, i) => {
      const comma = i < workingModels.length - 1 ? ',' : '';
      console.log(`  "${m.model}"${comma}`);
    });
    console.log('];');
  } else {
    console.log('❌ No working models found!');
  }
}

testAllModels();

import 'dotenv/config';
import fetch from 'node-fetch';

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

async function listModels() {
  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('Error: VITE_GEMINI_API_KEY is not set or is a placeholder in your .env file.');
    console.log('Please ensure your .env file exists in the project root and contains your actual VITE_GEMINI_API_KEY.');
    return;
  }

  console.log('Fetching available Gemini models...');

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (response.ok) {
      if (data.models && data.models.length > 0) {
        console.log('\nAvailable Models:');
        data.models.forEach(model => {
          console.log(`\nModel Name: ${model.name}`);
          console.log(`  Display Name: ${model.displayName}`);
          console.log(`  Version: ${model.version}`);
          console.log(`  Supported Generation Methods: ${model.supportedGenerationMethods.join(', ')}`);
          // console.log(`  Description: ${model.description}`); // Uncomment for more details
        });
      } else {
        console.log('No models found for your API key or an unexpected response format was received.');
        console.log('Raw response:', JSON.stringify(data, null, 2));
      }
    } else {
      console.error(`Error fetching models: ${response.status} ${response.statusText}`);
      console.error('Response body:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('An error occurred while fetching the models:', error);
  }
}

listModels();

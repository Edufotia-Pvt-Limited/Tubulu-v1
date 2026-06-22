const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = 'http://localhost:3008/api/v1/whatsapp/simulate';

console.log('--- Tubulu AI WhatsApp Simulator ---');
console.log('Type a message to chat with the AI Agent (e.g., "I want some bread")');
console.log('Type "exit" to quit.\n');

async function chat() {
  rl.question('You: ', async (message) => {
    if (message.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        message: message,
        phone: '+919999999999'
      });

      console.log('\nTubulu AI:', response.data.response, '\n');
    } catch (error) {
      console.error('Error connecting to AI Agent. Make sure the backend is running on port 3008.');
      if (error.response) {
        console.error('Details:', error.response.data);
      }
    }

    chat();
  });
}

chat();

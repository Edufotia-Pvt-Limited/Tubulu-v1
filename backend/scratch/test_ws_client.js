const WebSocket = require('ws');
console.log('Attempting to connect to wss://division-blog-trailing.ngrok-free.dev/ ...');
const ws = new WebSocket('wss://division-blog-trailing.ngrok-free.dev/');

ws.on('open', () => {
  console.log('Successfully connected to WebSocket server!');
  ws.send(JSON.stringify({ event: 'start', didNumber: '07127191144', callerPhone: '9844982389' }));
});

ws.on('message', (data) => {
  console.log('Received message:', data.toString());
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err.message);
});

ws.on('close', (code, reason) => {
  console.log('Connection closed:', code, reason.toString());
  process.exit(0);
});

setTimeout(() => {
  console.log('Timeout after 10s');
  ws.close();
}, 10000);

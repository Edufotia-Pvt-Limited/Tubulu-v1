const { spawn } = require('child_process');

function startTunnel() {
  console.log('[TUNNEL] Starting localtunnel with 127.0.0.1 local-host...');
  // Use spawn to start localtunnel pointing to 127.0.0.1 to avoid local DNS delays
  const lt = spawn('lt', [
    '--port', '8080',
    '--subdomain', 'shaggy-panther-50',
    '--local-host', '127.0.0.1',
    '--print-requests'
  ], {
    shell: true
  });

  lt.stdout.on('data', (data) => {
    console.log(`[TUNNEL STDOUT]: ${data.toString().trim()}`);
  });

  lt.stderr.on('data', (data) => {
    console.error(`[TUNNEL STDERR]: ${data}`);
  });

  lt.on('close', (code) => {
    console.log(`[TUNNEL] Localtunnel exited with code ${code}. Restarting in 5 seconds...`);
    setTimeout(startTunnel, 5000);
  });
  
  lt.on('error', (err) => {
    console.error('[TUNNEL] Localtunnel error:', err);
    setTimeout(startTunnel, 5000);
  });
}

startTunnel();

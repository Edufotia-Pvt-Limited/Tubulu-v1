const fixUrl = (url, req) => {
    if (!url || typeof url !== 'string') return url;
    
    // If it's already an absolute external URL (S3, Swiggy, etc), leave it
    if (url.startsWith('https://') && !url.includes('10.0.2.2') && !url.includes('localhost')) {
        return url;
    }

    const host = req.get('host');
    let protocol = req.headers['x-forwarded-proto'] || req.protocol;
    
    // Force HTTPS for any public domains/tunnels if accessed externally
    const isLocal = host.includes('localhost') || 
                    host.includes('127.0.0.1') || 
                    host.includes('10.0.2.2') || 
                    host.startsWith('192.168.') || 
                    host.startsWith('10.');
                    
    if (!isLocal || host.includes('loca.lt') || host.includes('serveo')) {
        protocol = 'https';
    }
    
    // Replace emulator/localhost with the current public host
    let fixed = url.replace('http://10.0.2.2:3008', `${protocol}://${host}`);
    fixed = fixed.replace('http://localhost:3008', `${protocol}://${host}`);
    
    // If it's a relative path, prepend the host
    if (fixed.startsWith('/images/')) {
        fixed = `${protocol}://${host}${fixed}`;
    }

    console.log(`[URLFIX] Fixed: ${url} -> ${fixed}`);
    return fixed;
};

module.exports = { fixUrl };

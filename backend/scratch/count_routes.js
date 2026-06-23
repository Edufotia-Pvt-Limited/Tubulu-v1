const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../Routes');
const files = fs.readdirSync(routesDir);

let totalCount = 0;
const report = [];

files.forEach(file => {
    if (!file.endsWith('.js')) return;
    
    const filePath = path.join(routesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    let count = 0;
    const lines = content.split('\n');
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (
            (trimmed.startsWith('router.') || trimmed.startsWith('app.')) &&
            (trimmed.includes('.get(') || trimmed.includes('.post(') || trimmed.includes('.put(') || trimmed.includes('.delete(') || trimmed.includes('.patch('))
        ) {
            count++;
        }
    });
    
    totalCount += count;
    report.push({ file, count });
});

console.log('=== ROUTE ANALYSIS ===');
report.forEach(item => {
    console.log(`${item.file}: ${item.count}`);
});
console.log(`TOTAL ENDPOINTS: ${totalCount}`);

const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');
if (!content.includes('req.method, req.url')) {
  const newContent = content.replace("app.use(cors())", "app.use(cors())\napp.use((req, res, next) => { console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.url); next(); });");
  fs.writeFileSync('index.js', newContent);
}

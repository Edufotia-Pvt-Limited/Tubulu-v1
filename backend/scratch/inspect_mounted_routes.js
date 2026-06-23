const express = require("express");
const { logger } = require("../Utils/Logger");
const app = express();

// Mock connect function so it doesn't actually call DB 
const pg = require("../Utils/Postgres");
pg.connectPostgres = () => { console.log("Postgres mocked."); };

// Require server file but prevent app.listen
const path = require('path');
require.cache[require.resolve('../index')] = { exports: {} }; // Hack to block recursive load

// Let me just require individual route files and dump their layers
const fs = require('fs');
const routeFiles = fs.readdirSync(path.join(__dirname, '../Routes'));

console.log("Scanning Route Definitions in backend/index.js via text search instead of require loop...\n");

const indexJs = fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8');
const regex = /app\.use\(['"](.+?)['"]\s*,\s*([A-Za-z0-9]+)/g;
let m;
console.log("FOUND REGISTERED ENDPOINTS IN INDEX.JS:");
while ((m = regex.exec(indexJs)) !== null) {
    console.log(`  🚩 PATH: ${m[1]} -> TARGET: ${m[2]}`);
}

console.log("\nCheck complete.");
process.exit(0);

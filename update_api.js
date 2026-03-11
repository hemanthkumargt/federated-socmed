const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('C:/Users/heman/OneDrive/Documents/SWE/frontend/src');
let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    content = content.replace(/['"]http:\/\/localhost:5000\/api['"]/g, '(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api")');
    content = content.replace(/['"]http:\/\/localhost:5000['"]/g, '(import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace("/api", "") : "http://localhost:5000")');
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('Fixed:', file);
  }
});
console.log('Total files changed:', changed);

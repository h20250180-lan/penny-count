const fs = require('fs');
const path = require('path');
const { pathToRegexp } = require('path-to-regexp');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir).filter(f => f.startsWith('routes') || f.startsWith('routes.'));

function extractPaths(content) {
  const paths = [];
  // match router.METHOD('path', or router.METHOD("path",
  const re = /router\.(get|post|put|delete|patch|all)\s*\(\s*(['"])(.*?)\2/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    paths.push(m[3]);
  }
  // also match app.use('/prefix', ...)
  const re2 = /app\.use\(\s*(['"])(.*?)\1/g;
  while ((m = re2.exec(content)) !== null) {
    paths.push(m[2]);
  }
  return paths;
}

let problems = [];
for (const f of files) {
  const fp = path.join(dir, f);
  const content = fs.readFileSync(fp, 'utf8');
  const paths = extractPaths(content);
  paths.forEach(p => {
    try {
      pathToRegexp(p);
    } catch (err) {
      problems.push({ file: f, path: p, error: err.message });
    }
  });
}

if (problems.length === 0) {
  console.log('No problematic route patterns found.');
  process.exit(0);
}

console.log('Problems found:');
problems.forEach(p => console.log(`${p.file}: '${p.path}' -> ${p.error}`));
process.exit(1);

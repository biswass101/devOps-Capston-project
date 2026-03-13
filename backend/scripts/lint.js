const { readdirSync, readFileSync, statSync } = require('node:fs');
const { join } = require('node:path');
const { Script } = require('node:vm');

const root = join(__dirname, '..');
const targets = ['src', 'test'];
const failures = [];

function collectJsFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return collectJsFiles(fullPath);
    }

    return fullPath.endsWith('.js') ? [fullPath] : [];
  });
}

function validateFile(filePath) {
  const source = readFileSync(filePath, 'utf8');

  try {
    new Script(source, { filename: filePath });
  } catch (error) {
    failures.push(`${filePath}: syntax error: ${error.message}`);
  }

  if (source.includes('\t')) {
    failures.push(`${filePath}: tab indentation detected`);
  }

  if (/[ \t]+$/m.test(source)) {
    failures.push(`${filePath}: trailing whitespace detected`);
  }
}

for (const target of targets) {
  for (const filePath of collectJsFiles(join(root, target))) {
    validateFile(filePath);
  }
}

if (failures.length > 0) {
  console.error('Backend lint failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Backend lint passed.');

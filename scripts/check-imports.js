const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const SRC_DIR = path.resolve(__dirname, '../src'); // Path to your src directory
const PACKAGE_JSON_PATH = path.resolve(__dirname, '../package.json');

// File extensions to scan for imports
const SCAN_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

// Extensions to append when resolving relative imports
const RESOLVE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.mjs'];

// Path Aliases (e.g., '@/' mapping to 'src/') - edit to match your config
const ALIASES = {
  '@': SRC_DIR,
};
// ----------------------

// Read package.json to verify third-party package dependencies
let installedDependencies = new Set();
if (fs.existsSync(PACKAGE_JSON_PATH)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    installedDependencies = new Set(Object.keys(deps));
  } catch (err) {
    console.warn('⚠️ Could not parse package.json for external module checks.');
  }
}

let totalFilesScanned = 0;
let totalImportsChecked = 0;
const missingImports = [];

/**
 * Strips JS single-line and multi-line comments
 */
function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
}

/**
 * Checks if a relative file path or directory index exists
 */
function fileExists(filePath) {
  // Direct file check
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return true;
  }

  // Try appending extensions (.jsx, .js, etc.)
  for (const ext of RESOLVE_EXTENSIONS) {
    if (fs.existsSync(filePath + ext) && fs.statSync(filePath + ext).isFile()) {
      return true;
    }
  }

  // Try index files (e.g., ./components/Button/index.jsx)
  for (const ext of RESOLVE_EXTENSIONS) {
    const indexPath = path.join(filePath, `index${ext}`);
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      return true;
    }
  }

  return false;
}

/**
 * Recursively scans directories for source files
 */
function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath, fileList);
    } else if (SCAN_EXTENSIONS.includes(path.extname(filePath))) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

/**
 * Resolves imported paths against aliases, relative files, or node_modules
 */
function resolveImport(importPath, currentFile) {
  // 1. Resolve Path Aliases (e.g., '@/components/Button')
  for (const [alias, targetDir] of Object.entries(ALIASES)) {
    if (importPath === alias || importPath.startsWith(alias + '/')) {
      const resolvedAliasPath = importPath.replace(alias, targetDir);
      return fileExists(resolvedAliasPath);
    }
  }

  // 2. Resolve Relative Imports (e.g., './Button', '../utils/math')
  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    const absolutePath = importPath.startsWith('/')
      ? path.join(SRC_DIR, importPath)
      : path.resolve(path.dirname(currentFile), importPath);

    return fileExists(absolutePath);
  }

  // 3. Resolve Third-Party Dependencies (e.g., 'react', 'lodash/get')
  const pkgName = importPath.startsWith('@')
    ? importPath.split('/').slice(0, 2).join('/')
    : importPath.split('/')[0];

  // Node built-in modules (fs, path, etc.)
  if (require('module').builtinModules.includes(pkgName)) {
    return true;
  }

  // Check if listed in package.json
  return installedDependencies.has(pkgName);
}

/**
 * Main analysis function
 */
function analyzeFile(filePath) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const cleanContent = stripComments(rawContent);

  // Regex matches standard imports, dynamic imports, and re-exports
  const importRegex = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match;
  totalFilesScanned++;

  while ((match = importRegex.exec(cleanContent)) !== null) {
    const importSpecifier = match[1] || match[2] || match[3];

    if (!importSpecifier) continue;
    totalImportsChecked++;

    const isResolved = resolveImport(importSpecifier, filePath);

    if (!isResolved) {
      // Calculate line number
      const lineNumber = rawContent.substring(0, match.index).split('\n').length;
      
      missingImports.push({
        file: path.relative(process.cwd(), filePath),
        line: lineNumber,
        importPath: importSpecifier,
      });
    }
  }
}

// --- RUN CHECK ---
console.log('\n🔍 Scanning codebase for missing imports...\n');
const startTime = Date.now();

try {
  const allFiles = walkDirectory(SRC_DIR);
  allFiles.forEach(analyzeFile);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`--------------------------------------------------`);
  console.log(`📊 Scanned ${totalFilesScanned} files & checked ${totalImportsChecked} imports in ${duration}s`);
  console.log(`--------------------------------------------------\n`);

  if (missingImports.length === 0) {
    console.log('✅ All imports are resolved and valid!\n');
    process.exit(0);
  } else {
    console.log(`❌ Found ${missingImports.length} BROKEN or MISSING imports:\n`);

    missingImports.forEach(({ file, line, importPath }) => {
      console.log(`  📍 \x1b[36m${file}\x1b[0m:\x1b[33m${line}\x1b[0m`);
      console.log(`     └── Missing Target: \x1b[31m"${importPath}"\x1b[0m\n`);
    });

    process.exit(1);
  }
} catch (error) {
  console.error('Fatal error scanning directory:', error);
  process.exit(1);
}
// Auto-generate PlantUML sequence diagram for "search product" feature
// Heuristics-based extractor for Spring Boot + React code in this repository
// Output: docs/diagrams/product_search_sequence.puml

const fs = require('fs');
const path = require('path');

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return '';
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const root = path.resolve(__dirname, '..');
const controllerPath = path.join(root, 'demo', 'src', 'main', 'java', 'com', 'example', 'demo', 'products', 'ProductController.java');
const servicePath = path.join(root, 'demo', 'src', 'main', 'java', 'com', 'example', 'demo', 'products', 'ProductService.java');
const repoPath = path.join(root, 'demo', 'src', 'main', 'java', 'com', 'example', 'demo', 'products', 'ProductRepository.java');
const frontendApiPath = path.join(root, 'foodsystem', 'src', 'api', 'product.js');

const controllerSrc = readFileSafe(controllerPath);
const serviceSrc = readFileSafe(servicePath);
const repoSrc = readFileSafe(repoPath);
const feSrc = readFileSafe(frontendApiPath);

// Extract base path @RequestMapping in controller
function extractBasePath(javaSrc) {
  const m = javaSrc.match(/@RequestMapping\("([^"]+)"\)/);
  return m ? m[1] : '/api/products';
}

// Extract search endpoint path
function extractSearchEndpoint(javaSrc) {
  // Look for @GetMapping("/search")
  const m = javaSrc.match(/@GetMapping\("([^"]*search[^"]*)"\)/);
  return m ? m[1] : '/search';
}

// Extract which service method is called from search controller method
function extractServiceInvocation(javaSrc) {
  // Find the searchProducts method body in controller
  const methodRegex = /@GetMapping\("[^\)]*search[^\)]*"\)[\s\S]*?public\s+[^\(]+\(.*\)\s*\{([\s\S]*?)\n\s*\}/m;
  const mm = javaSrc.match(methodRegex);
  if (mm) {
    const body = mm[1];
    const call = body.match(/service\.(\w+)\s*\(/);
    return call ? call[1] : 'searchProducts';
  }
  return 'searchProducts';
}

// Extract repository calls inside ProductService.searchProducts
function extractRepoCalls(serviceSrc) {
  const out = [];
  const serviceMethodRegex = /public\s+List<\s*Product\s*>\s+searchProducts\s*\(\s*String\s+keyword\s*\)\s*\{([\s\S]*?)\n\s*\}/m;
  const m = serviceSrc.match(serviceMethodRegex);
  if (!m) return out;
  const body = m[1];
  const repoCalls = [...body.matchAll(/repo\.(\w+)\s*\(/g)].map(x => x[1]);
  for (const c of repoCalls) {
    if (!out.includes(c)) out.push(c);
  }
  return out;
}

// Extract @Query content for repo.searchProducts
function extractRepoSearchQuery(repoSrc) {
  const m = repoSrc.match(/@Query\("([\s\S]*?)"\)\s*\n\s*List<\s*Product\s*>\s*searchProducts\s*\(/m);
  if (m) {
    return m[1]
      .replace(/\s+/g, ' ')
      .trim();
  }
  return null;
}

// Extract frontend fetch path
function extractFrontendFetch(feSrc) {
  const m = feSrc.match(/fetch\(`\$\{API_BASE_URL\}([^`]+\/products\/search[^`]+)`\)/);
  if (m) {
    return m[1]; // like "/products/search?keyword=..."
  }
  // Try simpler match
  const m2 = feSrc.match(/`\$\{API_BASE_URL\}([^`]+\/products\/search[^`]*)`/);
  return m2 ? m2[1] : '/products/search?keyword={keyword}';
}

const basePath = extractBasePath(controllerSrc); // e.g. /api/products
const searchPath = extractSearchEndpoint(controllerSrc); // e.g. /search
const ctrlServiceMethod = extractServiceInvocation(controllerSrc); // e.g. searchProducts
const repoCalls = extractRepoCalls(serviceSrc); // e.g. findByNameContainingIgnoreCase, searchProducts
const repoQuery = extractRepoSearchQuery(repoSrc);
const feFetch = extractFrontendFetch(feSrc);

// Compose sequence diagram
const lines = [];
lines.push('@startuml');
lines.push('title Product Search Flow');
lines.push('skinparam monochrome true');
lines.push('skinparam sequenceArrowThickness 1');
lines.push('skinparam sequenceParticipant underline');
lines.push('actor User');
lines.push('participant "React App" as FE');
lines.push('participant "Product API (ProductController)" as API');
lines.push('participant "ProductService" as SVC');
lines.push('participant "ProductRepository" as REPO');
lines.push('database DB');

lines.push('');
lines.push('User -> FE : Nhập từ khóa tìm kiếm');
lines.push(`FE -> API : GET ${basePath}${searchPath}?keyword=...`);
lines.push('activate API');
lines.push(`API -> SVC : ${ctrlServiceMethod}(keyword)`);
lines.push('activate SVC');

if (repoCalls.includes('findByNameContainingIgnoreCase')) {
  lines.push('SVC -> REPO : findByNameContainingIgnoreCase(keyword)');
  lines.push('activate REPO');
  lines.push('REPO -> DB : Query by name (case-insensitive)');
  lines.push('DB --> REPO : List<Product> results1');
  lines.push('deactivate REPO');
}

if (repoCalls.includes('searchProducts')) {
  // Add an alt block describing fallback logic if both were detected
  if (repoCalls.includes('findByNameContainingIgnoreCase')) {
    lines.push('alt results1 trống');
  }
  lines.push('SVC -> REPO : searchProducts(keyword)');
  lines.push('activate REPO');
  if (repoQuery) {
    lines.push(`note right of REPO: ${repoQuery.replace(/"/g, '\\"')}`);
  } else {
    lines.push('REPO -> DB : JPQL tìm theo tên hoặc mô tả');
  }
  lines.push('DB --> REPO : List<Product> results2');
  lines.push('deactivate REPO');
  if (repoCalls.includes('findByNameContainingIgnoreCase')) {
    lines.push('end');
  }
}

lines.push('SVC --> API : List<Product>');
lines.push('deactivate SVC');
lines.push('API --> FE : 200 OK + JSON');
lines.push('deactivate API');
lines.push('FE --> User : Hiển thị danh sách sản phẩm');

// Diagnostics
lines.push('note over FE,API #DDFFDD');
lines.push(` Frontend fetch: \n GET ${feFetch}`);
lines.push('end note');

lines.push('@enduml');

// Write output
const outDir = path.join(root, 'docs', 'diagrams');
ensureDir(outDir);
const outFile = path.join(outDir, 'product_search_sequence.puml');
fs.writeFileSync(outFile, lines.join('\n'), 'utf8');

console.log('✅ Generated:', path.relative(root, outFile));
console.log('   Base path:', basePath);
console.log('   Search path:', searchPath);
console.log('   Controller calls service method:', ctrlServiceMethod);
console.log('   Service -> Repo calls:', repoCalls.join(', ') || '(none)');
if (repoQuery) {
  console.log('   Repo.searchProducts JPQL:', repoQuery);
}
if (feFetch) {
  console.log('   Frontend fetch path:', feFetch);
}

const fs = require('fs');
const path = require('path');

const extensionDir = path.join(__dirname, '..');

console.log('🔍 TradeAutopsy Extension Verification');
console.log('=' .repeat(50));
console.log('');

const checks = [];

// Helper function to add check result
function check(name, condition, errorMsg = '') {
  checks.push({ name, passed: condition, errorMsg });
  const status = condition ? '✅' : '❌';
  console.log(`${status} ${name}${!condition && errorMsg ? ` - ${errorMsg}` : ''}`);
  return condition;
}

// 1. Check manifest.json
console.log('📄 Manifest Validation');
console.log('-'.repeat(30));

let manifest = null;
const manifestPath = path.join(extensionDir, 'manifest.json');

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    check('manifest.json exists and is valid JSON', true);
    check('manifest_version is 3', manifest.manifest_version === 3);
    check('name is set', !!manifest.name);
    check('version is set', !!manifest.version);
    check('description is set', !!manifest.description);
    check('permissions array exists', Array.isArray(manifest.permissions));
    check('action.default_popup is set', !!manifest.action?.default_popup);
    check('background.service_worker is set', !!manifest.background?.service_worker);
  } catch (e) {
    check('manifest.json is valid JSON', false, e.message);
  }
} else {
  check('manifest.json exists', false, 'File not found');
}

console.log('');

// 2. Check icon files
console.log('🎨 Icon Files');
console.log('-'.repeat(30));

const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
  const iconPath = path.join(extensionDir, 'assets', `icon-${size}.png`);
  const exists = fs.existsSync(iconPath);
  if (exists) {
    const stats = fs.statSync(iconPath);
    check(`icon-${size}.png exists`, true);
    // Basic size check (should be > 100 bytes for a valid PNG)
    check(`icon-${size}.png is valid`, stats.size > 100, 'File seems empty or corrupt');
  } else {
    check(`icon-${size}.png exists`, false, 'Run: npm run generate:icons');
  }
});

console.log('');

// 3. Check popup files
console.log('🖼️  Popup Files');
console.log('-'.repeat(30));

const popupFiles = ['index.html', 'styles.css', 'app.js', 'settings.html', 'settings.js', 'settings-styles.css'];
popupFiles.forEach(file => {
  const filePath = path.join(extensionDir, 'popup', file);
  check(`popup/${file} exists`, fs.existsSync(filePath));
});

console.log('');

// 4. Check background service worker
console.log('⚙️  Background Script');
console.log('-'.repeat(30));

const serviceWorkerPath = path.join(extensionDir, 'background', 'service-worker.js');
check('service-worker.js exists', fs.existsSync(serviceWorkerPath));

console.log('');

// 5. Check lib files
console.log('📚 Library Files');
console.log('-'.repeat(30));

const apiPath = path.join(extensionDir, 'lib', 'api.js');
check('lib/api.js exists', fs.existsSync(apiPath));

console.log('');

// 6. Check promo images (optional but recommended)
console.log('🖼️  Promotional Images (for Chrome Web Store)');
console.log('-'.repeat(30));

const promoFiles = [
  'small-tile.png',           // 440x280
  'large-tile.png',           // 920x680
  'screenshot-1-green.png',   // 1280x800 - green status
  'screenshot-2-violation.png', // 1280x800 - red violation
  'screenshot-4-warning.png'  // 1280x800 - yellow warning
];
const promoDir = path.join(extensionDir, 'assets', 'promo');

promoFiles.forEach(file => {
  const filePath = path.join(promoDir, file);
  const exists = fs.existsSync(filePath);
  if (exists) {
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    check(`promo/${file} (${sizeKB}KB)`, true);
  } else {
    console.log(`⚠️  promo/${file} missing`);
  }
});

console.log('');

// Summary
console.log('=' .repeat(50));
const passed = checks.filter(c => c.passed).length;
const failed = checks.filter(c => !c.passed).length;

if (failed === 0) {
  console.log('');
  console.log('✨ All checks passed! Extension is ready for packaging.');
  console.log('');
  console.log('Next steps:');
  console.log('  1. npm run package    - Create ZIP for Chrome Web Store');
  console.log('  2. Load unpacked in chrome://extensions for testing');
  console.log('');
} else {
  console.log('');
  console.log(`❌ ${failed} check(s) failed, ${passed} passed`);
  console.log('');
  console.log('Fix the issues above before packaging.');
  process.exit(1);
}


const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const extensionDir = path.join(__dirname, '..');
const distDir = path.join(extensionDir, 'dist');

// Read manifest to get version
const manifest = JSON.parse(fs.readFileSync(path.join(extensionDir, 'manifest.json'), 'utf8'));
const version = manifest.version;

// Required files for the extension
const requiredFiles = [
  'manifest.json',
  'popup/index.html',
  'popup/styles.css',
  'popup/app.js',
  'popup/settings.html',
  'background/service-worker.js',
  'lib/api.js',
  'assets/icon-16.png',
  'assets/icon-48.png',
  'assets/icon-128.png',
];

console.log('📦 Packaging TradeAutopsy Extension v' + version);
console.log('=' .repeat(50));

// Verify required files exist
console.log('\n🔍 Verifying required files...\n');

let missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(extensionDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} (MISSING)`);
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log('\n❌ Missing required files:');
  missingFiles.forEach(f => console.log(`   - ${f}`));
  console.log('\nRun these commands first:');
  console.log('  npm run generate:icons');
  console.log('  npm run generate:promo');
  process.exit(1);
}

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create the zip file
const zipFileName = `tradeautopsy-extension-v${version}.zip`;
const zipFilePath = path.join(distDir, zipFileName);

// Remove existing zip if exists
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

const output = fs.createWriteStream(zipFilePath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', function() {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log('\n' + '='.repeat(50));
  console.log(`✨ Extension packaged successfully!`);
  console.log(`📁 Output: dist/${zipFileName}`);
  console.log(`📊 Size: ${sizeMB} MB`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Go to Chrome Web Store Developer Dashboard');
  console.log('2. Upload the ZIP file');
  console.log('3. Complete the listing information');
  console.log('4. Submit for review');
});

archive.on('error', function(err) {
  console.error('❌ Packaging failed:', err);
  process.exit(1);
});

archive.pipe(output);

// Files to include in the package
const filesToInclude = [
  'manifest.json',
  'popup/',
  'background/',
  'lib/',
];

// Add icon files
const iconFiles = ['icon-16.png', 'icon-48.png', 'icon-128.png'];
iconFiles.forEach(icon => {
  const iconPath = path.join(extensionDir, 'assets', icon);
  if (fs.existsSync(iconPath)) {
    archive.file(iconPath, { name: `assets/${icon}` });
  }
});

// Add other required files and directories
filesToInclude.forEach(item => {
  const itemPath = path.join(extensionDir, item);
  if (fs.existsSync(itemPath)) {
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      archive.directory(itemPath, item);
    } else {
      archive.file(itemPath, { name: item });
    }
  }
});

archive.finalize();


const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const outputDir = path.join(__dirname, '..', 'assets');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create SVG icon
function createSVG(size) {
  const radius = size * 0.2;
  const fontSize = size * 0.55;
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#grad)"/>
    <text x="${size/2}" y="${size/2 + fontSize * 0.35}" 
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="${fontSize}px" 
          font-weight="800" 
          fill="white" 
          text-anchor="middle">T</text>
  </svg>`;
}

async function generateIcons() {
  console.log('🎨 Generating extension icons...\n');

  for (const size of sizes) {
    try {
      const svg = createSVG(size);
      const outputPath = path.join(outputDir, `icon-${size}.png`);
      
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}.png (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate icon-${size}.png:`, error.message);
    }
  }

  console.log('\n✨ Icon generation complete!');
  console.log(`📁 Output directory: ${outputDir}`);
}

generateIcons().catch(console.error);

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const promoDir = path.join(__dirname, '..', 'assets', 'promo');

const screenshots = [
  { 
    file: 'small-tile-440x280.html', 
    width: 440, 
    height: 280, 
    output: 'small-tile.png',
    description: 'Small promotional tile'
  },
  { 
    file: 'screenshot-1-green-1280x800.html', 
    width: 1280, 
    height: 800, 
    output: 'screenshot-1.png',
    description: 'Screenshot: Green status'
  },
  { 
    file: 'screenshot-2-warning-1280x800.html', 
    width: 1280, 
    height: 800, 
    output: 'screenshot-2.png',
    description: 'Screenshot: Warning status'
  },
  { 
    file: 'screenshot-3-violation-1280x800.html', 
    width: 1280, 
    height: 800, 
    output: 'screenshot-3.png',
    description: 'Screenshot: Violation status'
  },
  { 
    file: 'large-tile-920x680.html', 
    width: 920, 
    height: 680, 
    output: 'large-tile.png',
    description: 'Large promotional tile'
  },
];

async function generatePromoImages() {
  console.log('🖼️  Generating promotional images...\n');
  
  // Check if HTML files exist
  const missingFiles = screenshots.filter(s => {
    const filePath = path.join(promoDir, s.file);
    return !fs.existsSync(filePath);
  });

  if (missingFiles.length > 0) {
    console.log('❌ Missing HTML template files:');
    missingFiles.forEach(f => console.log(`   - ${f.file}`));
    console.log('\nPlease create these HTML files first.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const screenshot of screenshots) {
    const { file, width, height, output, description } = screenshot;
    
    try {
      const page = await browser.newPage();
      
      // Set viewport with 2x device scale for retina quality
      await page.setViewport({ 
        width, 
        height, 
        deviceScaleFactor: 2 
      });
      
      const filePath = `file://${path.join(promoDir, file)}`;
      await page.goto(filePath, { waitUntil: 'networkidle0' });
      
      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');
      
      // Small delay for any animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const outputPath = path.join(promoDir, output);
      await page.screenshot({ 
        path: outputPath, 
        type: 'png',
        omitBackground: false
      });
      
      console.log(`✅ Generated: ${output} (${width}x${height}) - ${description}`);
      
      await page.close();
    } catch (error) {
      console.log(`❌ Failed: ${output} - ${error.message}`);
    }
  }

  await browser.close();
  
  console.log('\n✨ Promo image generation complete!');
  console.log(`📁 Output directory: ${promoDir}`);
}

generatePromoImages().catch(console.error);


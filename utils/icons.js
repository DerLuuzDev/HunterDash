const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const SVG_FILE = 'assets/icons/hunterdash.svg';
const OUTPUT_PNG = 'assets/icons/hunterdash.png';

async function generateIcons() {
  console.log('🎨 Generiere Icons für HunterDash...');
  
  try {
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    
    const svgContent = fs.readFileSync(SVG_FILE, 'utf8');
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    const img = await loadImage(dataUrl);
    
    ctx.drawImage(img, 0, 0, 512, 512);
    
    const pngBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(OUTPUT_PNG, pngBuffer);
    
    console.log(`✅ PNG Icon erstellt: ${OUTPUT_PNG}`);
    console.log('ℹ️  ICO Icon wird von electron-builder automatisch generiert');
    
  } catch (error) {
    console.error('❌ Fehler beim Generieren der Icons:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateIcons();
}

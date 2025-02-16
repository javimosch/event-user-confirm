const sharp = require('sharp');
const path = require('path');

async function generateFavicon() {
  try {
    const inputPath = path.join(__dirname, '../public/icon.svg');
    const outputPath = path.join(__dirname, '../public/favicon.ico');

    await sharp(inputPath)
      .resize(32, 32)
      .toFile(outputPath);

    console.log('✅ Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();

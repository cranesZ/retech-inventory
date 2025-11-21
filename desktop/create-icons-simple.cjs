#!/usr/bin/env node

/**
 * Simplified Icon Generation for Retech Inventory
 * Uses sharp library to convert SVG to PNG
 *
 * Usage: node create-icons-simple.js
 *
 * Install dependencies: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

// Try to load sharp, with helpful error message if not available
let sharp;
try {
  sharp = require('sharp');
  console.log('✓ sharp library found');
} catch (e) {
  console.error('\n❌ Error: "sharp" library is required but not installed.');
  console.error('\nInstall it with:');
  console.error('  npm install --save-dev sharp');
  console.error('\nAlternatively, use ImageMagick:');
  console.error('  brew install imagemagick  # macOS');
  console.error('  apt-get install imagemagick  # Linux');
  console.error('\nThen run the build-icons.sh script.\n');
  process.exit(1);
}

const projectRoot = __dirname;
const publicDir = path.join(projectRoot, 'public');
const buildDir = path.join(projectRoot, 'build');
const svgSource = path.join(publicDir, 'logo.svg');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const sizes = [16, 32, 64, 128, 256, 512];

async function createIcons() {
  try {
    console.log('\n📦 Building Retech Inventory icons...');
    console.log(`Source: ${svgSource}`);
    console.log('');

    // Check if SVG exists
    if (!fs.existsSync(svgSource)) {
      throw new Error(`SVG source not found: ${svgSource}`);
    }

    const pngFiles = {};

    // Generate PNG icons for each size
    console.log('Creating PNG icons...');
    for (const size of sizes) {
      const outputFile = path.join(buildDir, `icon-${size}x${size}.png`);
      await sharp(svgSource, { density: 300 })
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputFile);

      pngFiles[size] = outputFile;
      const stats = fs.statSync(outputFile);
      console.log(`  ✓ ${size}×${size} PNG (${formatBytes(stats.size)})`);
    }

    // Create favicon (256x256 PNG)
    console.log('');
    console.log('Creating favicon...');
    const faviconPath = path.join(publicDir, 'favicon.png');
    await sharp(svgSource, { density: 300 })
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 100 })
      .toFile(faviconPath);

    const faviconStats = fs.statSync(faviconPath);
    console.log(`  ✓ favicon.png (${formatBytes(faviconStats.size)})`);

    // Create Windows ICO file
    console.log('');
    console.log('Creating Windows .ico file...');

    try {
      const PngToIco = require('png-to-ico');
      const icoPath = path.join(buildDir, 'icon.ico');

      // Use top images for ICO file
      const images = [
        pngFiles[256],
        pngFiles[128],
        pngFiles[64],
        pngFiles[32],
        pngFiles[16]
      ];

      await PngToIco(images).then(buf => {
        fs.writeFileSync(icoPath, buf);
        const stats = fs.statSync(icoPath);
        console.log(`  ✓ icon.ico (${formatBytes(stats.size)})`);
      });

    } catch (e) {
      // Fallback: try using ico-convert
      try {
        const icoConvert = require('ico-convert');
        const icoPath = path.join(buildDir, 'icon.ico');

        const imageBuffers = await Promise.all([
          fs.promises.readFile(pngFiles[256]),
          fs.promises.readFile(pngFiles[128]),
          fs.promises.readFile(pngFiles[64]),
          fs.promises.readFile(pngFiles[32]),
          fs.promises.readFile(pngFiles[16])
        ]);

        const icoBuffer = await icoConvert.toIco(imageBuffers);
        fs.writeFileSync(icoPath, icoBuffer);
        const stats = fs.statSync(icoPath);
        console.log(`  ✓ icon.ico (${formatBytes(stats.size)})`);

      } catch (e2) {
        console.warn(`  ⚠ Could not create .ico file`);
        console.warn(`    Install with: npm install --save-dev ico-convert`);
        console.warn(`    Or: npm install --save-dev png-to-ico`);
      }
    }

    // Create macOS ICNS file
    console.log('');
    console.log('Creating macOS .icns file...');

    try {
      const toIcns = require('to-icns');
      const icnsPath = path.join(buildDir, 'icon.icns');

      const icons = {
        '16x16': pngFiles[16],
        '32x32': pngFiles[32],
        '64x64': pngFiles[64],
        '128x128': pngFiles[128],
        '256x256': pngFiles[256],
        '512x512': pngFiles[512]
      };

      await toIcns({ input: Object.values(icons), output: icnsPath });
      const stats = fs.statSync(icnsPath);
      console.log(`  ✓ icon.icns (${formatBytes(stats.size)})`);

    } catch (e) {
      // Fallback: Create iconset structure manually for later use
      try {
        const { execSync } = require('child_process');
        const iconsetDir = path.join(buildDir, 'icon.iconset');

        // Create iconset directory
        if (!fs.existsSync(iconsetDir)) {
          fs.mkdirSync(iconsetDir, { recursive: true });
        }

        // Copy files with proper naming convention
        const mappings = [
          [16, 'icon_16x16.png'],
          [32, 'icon_32x32.png'],
          [64, 'icon_64x64.png'],
          [128, 'icon_128x128.png'],
          [256, 'icon_256x256.png'],
          [512, 'icon_512x512.png'],
          [32, 'icon_16x16@2x.png'],
          [64, 'icon_32x32@2x.png'],
          [128, 'icon_64x64@2x.png'],
          [256, 'icon_128x128@2x.png'],
          [512, 'icon_256x256@2x.png'],
        ];

        mappings.forEach(([size, name]) => {
          if (pngFiles[size]) {
            fs.copyFileSync(pngFiles[size], path.join(iconsetDir, name));
          }
        });

        // Try to convert using iconutil (macOS only)
        try {
          execSync(`iconutil -c icns "${iconsetDir}" -o "${path.join(buildDir, 'icon.icns')}"`, {
            stdio: 'inherit'
          });
          const stats = fs.statSync(path.join(buildDir, 'icon.icns'));
          console.log(`  ✓ icon.icns (${formatBytes(stats.size)})`);

          // Clean up iconset
          fs.rmSync(iconsetDir, { recursive: true });
        } catch (execError) {
          if (process.platform === 'darwin') {
            console.warn(`  ⚠ iconutil command failed`);
            console.warn(`     Iconset is ready at: ${iconsetDir}`);
            console.warn(`     Try: iconutil -c icns "${iconsetDir}" -o "${path.join(buildDir, 'icon.icns')}"`);
          } else {
            console.warn(`  ⚠ .icns generation requires macOS`);
            console.warn(`     Iconset prepared at: ${iconsetDir}`);
            console.warn(`     Copy to macOS and run: iconutil -c icns icon.iconset -o icon.icns`);
          }
        }
      } catch (setupError) {
        console.warn(`  ⚠ Could not create .icns file`);
        console.warn(`    Install with: npm install --save-dev to-icns`);
        console.warn(`    Or use iconutil on macOS after installing: npm install --save-dev`);
      }
    }

    // Summary
    console.log('');
    console.log('✅ Icon generation complete!');
    console.log('');
    console.log('Generated files:');
    const builtFiles = fs.readdirSync(buildDir);
    builtFiles.forEach(file => {
      if (/\.(png|ico|icns)$/.test(file)) {
        const filePath = path.join(buildDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  ${file.padEnd(20)} ${formatBytes(stats.size)}`);
      }
    });

    console.log('');
    console.log('Configuration updates needed:');
    console.log('1. Update electron-builder in package.json to:');
    console.log('   "build": {');
    console.log('     "files": ["dist/**/*", "dist-electron/**/*"],');
    console.log('     "mac": { "icon": "build/icon.icns" },');
    console.log('     "win": { "icon": "build/icon.ico" },');
    console.log('     "linux": { "icon": "build/icon-512x512.png" }');
    console.log('   }');
    console.log('');
    console.log('2. Update favicon in index.html:');
    console.log('   <link rel="icon" type="image/png" href="/favicon.png" />');
    console.log('');
    console.log('3. Build the app:');
    console.log('   npm run package');

  } catch (error) {
    console.error('');
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Run
createIcons().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

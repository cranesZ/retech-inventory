#!/usr/bin/env node

/**
 * Icon Generation Script for Retech Inventory
 *
 * Converts SVG logo to PNG icons in multiple sizes
 * and creates macOS .icns and Windows .ico files
 *
 * Requirements: sharp library
 * Install: npm install --save-dev sharp ico-convert
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: "sharp" library is required.');
  console.error('Install it with: npm install --save-dev sharp ico-convert');
  process.exit(1);
}

const projectRoot = path.dirname(path.dirname(__filename));
const publicDir = path.join(projectRoot, 'public');
const buildDir = path.join(projectRoot, 'build');
const svgSource = path.join(publicDir, 'logo.svg');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const sizes = [16, 32, 64, 128, 256, 512];

async function generateIcons() {
  try {
    console.log('Building Retech Inventory icons...');
    console.log(`Source: ${svgSource}`);
    console.log('');

    // Check if SVG exists
    if (!fs.existsSync(svgSource)) {
      throw new Error(`SVG source not found: ${svgSource}`);
    }

    // Generate PNG icons for each size
    console.log('Creating PNG icons...');
    const pngFiles = [];

    for (const size of sizes) {
      const outputFile = path.join(buildDir, `icon-${size}x${size}.png`);
      await sharp(svgSource)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputFile);
      pngFiles.push(outputFile);
      console.log(`  ✓ Created ${size}×${size} PNG`);
    }

    // Create favicon
    console.log('');
    console.log('Creating favicon...');
    const faviconPath = path.join(publicDir, 'favicon.png');
    await sharp(svgSource)
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(faviconPath);
    console.log('  ✓ Created favicon.png');

    // Create ICO file for Windows (using PNG files)
    console.log('');
    console.log('Creating Windows .ico file...');
    try {
      const icoConvert = require('ico-convert');
      // Use multiple sizes for the ICO file
      const icoPath = path.join(buildDir, 'icon.ico');
      const images = [
        fs.readFileSync(path.join(buildDir, 'icon-256x256.png')),
        fs.readFileSync(path.join(buildDir, 'icon-128x128.png')),
        fs.readFileSync(path.join(buildDir, 'icon-64x64.png')),
        fs.readFileSync(path.join(buildDir, 'icon-32x32.png')),
        fs.readFileSync(path.join(buildDir, 'icon-16x16.png')),
      ];
      const icoBuffer = await icoConvert.toIco(images);
      fs.writeFileSync(icoPath, icoBuffer);
      console.log('  ✓ Created icon.ico');
    } catch (e) {
      console.warn('  ⚠ Could not create .ico file (ico-convert not installed)');
      console.warn('    Install with: npm install --save-dev ico-convert');
    }

    // Create ICNS file for macOS (using ImageMagick if available)
    console.log('');
    console.log('Creating macOS .icns file...');
    const { execSync } = require('child_process');
    try {
      // Create iconset directory structure
      const iconsetDir = path.join(buildDir, 'icon.iconset');
      if (!fs.existsSync(iconsetDir)) {
        fs.mkdirSync(iconsetDir, { recursive: true });
      }

      // Copy files to iconset with proper naming
      fs.copyFileSync(path.join(buildDir, 'icon-16x16.png'), path.join(iconsetDir, 'icon_16x16.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-32x32.png'), path.join(iconsetDir, 'icon_32x32.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-64x64.png'), path.join(iconsetDir, 'icon_64x64.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-128x128.png'), path.join(iconsetDir, 'icon_128x128.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-256x256.png'), path.join(iconsetDir, 'icon_256x256.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-512x512.png'), path.join(iconsetDir, 'icon_512x512.png'));

      // Create retina versions
      fs.copyFileSync(path.join(buildDir, 'icon-32x32.png'), path.join(iconsetDir, 'icon_16x16@2x.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-64x64.png'), path.join(iconsetDir, 'icon_32x32@2x.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-128x128.png'), path.join(iconsetDir, 'icon_64x64@2x.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-256x256.png'), path.join(iconsetDir, 'icon_128x128@2x.png'));
      fs.copyFileSync(path.join(buildDir, 'icon-512x512.png'), path.join(iconsetDir, 'icon_256x256@2x.png'));

      // Use iconutil to create .icns (macOS only)
      execSync(`iconutil -c icns "${iconsetDir}" -o "${path.join(buildDir, 'icon.icns')}"`, {
        stdio: 'inherit'
      });
      console.log('  ✓ Created icon.icns');

      // Clean up iconset directory
      fs.rmSync(iconsetDir, { recursive: true });
    } catch (e) {
      if (process.platform === 'darwin') {
        console.warn('  ⚠ iconutil not found or failed');
        console.warn('    This tool is only available on macOS');
      } else {
        console.warn('  ⚠ .icns generation skipped (not on macOS)');
        console.warn('    .icns files can only be created on macOS');
      }
    }

    console.log('');
    console.log('Icon generation complete!');
    console.log('');
    console.log('Generated files:');
    const files = fs.readdirSync(buildDir);
    const iconFiles = files.filter(f => /\.(png|icns|ico)$/.test(f));
    iconFiles.forEach(file => {
      const filePath = path.join(buildDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${file} (${formatBytes(stats.size)})`);
    });

    console.log('');
    console.log('Next steps:');
    console.log('1. Update electron-builder configuration in package.json');
    console.log('2. Update favicon reference in index.html');
    console.log('3. Run: npm run package');

  } catch (error) {
    console.error('Error generating icons:', error.message);
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

// Run icon generation
generateIcons();

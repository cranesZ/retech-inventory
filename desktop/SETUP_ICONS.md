# Quick Icon Setup for Retech Inventory

This document provides quick instructions to generate and configure icons for the Retech Inventory desktop application.

## One-Command Setup (Recommended)

If you have Node.js installed (which you should):

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Generate all icons
npm run build:icons

# 3. Build the application with icons
npm run package
```

That's it! The script will:
- Generate PNG icons in 6 sizes (16, 32, 64, 128, 256, 512 pixels)
- Create Windows .ico file
- Create macOS .icns file (if on macOS)
- Create browser favicon
- Provide guidance for next steps

## What Was Created

### Logo Design (logo.svg)
Professional warehouse/inventory-themed logo featuring:
- Blue gradient background (#0066CC to #0052A3)
- Warehouse shelving structure
- Inventory items on shelves
- Barcode element for scanning/tracking
- Checkmark for quality assurance
- Cyan accents (#00D4FF) for modern look

### Icon Files
```
desktop/
├── public/
│   ├── logo.svg         # Main vector source (scalable)
│   └── favicon.png      # 256×256 browser tab icon
├── build/
│   ├── icon-16x16.png   # Smallest
│   ├── icon-32x32.png
│   ├── icon-64x64.png
│   ├── icon-128x128.png
│   ├── icon-256x256.png
│   ├── icon-512x512.png # Largest
│   ├── icon.ico         # Windows (multi-size)
│   └── icon.icns        # macOS (if created)
└── index.html           # Updated favicon reference
```

## Files Updated

1. **index.html**
   - Changed favicon from `vite.svg` to `favicon.png`
   - Updated title to "Retech Inventory"

2. **package.json**
   - Added `build:icons` npm script
   - Added electron-builder configuration with icon paths
   - Added `sharp` dependency for icon generation
   - Added platform-specific build scripts

3. **public/logo.svg**
   - New professional inventory-themed logo
   - Scalable vector format

## Icon Generator Scripts Available

### Method 1: Node.js (Fastest & Recommended)
```bash
npm run build:icons
```
- Works on all platforms
- No additional system tools needed
- Generates all formats

### Method 2: Direct Node Script
```bash
node create-icons-simple.js
```
- Same as `npm run build:icons`
- Provides detailed progress and troubleshooting

### Method 3: Bash + ImageMagick (Linux/macOS)
```bash
chmod +x build-icons.sh
./build-icons.sh
```
- Requires: `brew install imagemagick` (macOS) or `apt-get install imagemagick` (Linux)
- Uses native ImageMagick tools
- Better for batch processing

### Method 4: Python + Pillow (Cross-Platform)
```bash
pip install Pillow cairosvg
chmod +x scripts/generate-icons.py
python3 scripts/generate-icons.py
```
- Requires Python with PIL and cairosvg
- Good for high-quality SVG rendering

## Building the Application

### Development
```bash
npm run dev
```
Icons will show in the Electron window.

### Package for All Platforms
```bash
npm run package
```
Creates:
- macOS DMG and ZIP
- Windows NSIS installer and portable EXE
- Linux AppImage and DEB package

### Package for Specific Platform
```bash
npm run package:mac     # macOS only
npm run package:win     # Windows only
npm run package:linux   # Linux only
```

## Platform-Specific Details

### macOS
- Uses `icon.icns` (Icon Bundle format)
- Contains 16, 32, 64, 128, 256, 512 px variants
- Includes retina (@2x) versions
- Auto-detected by electron-builder

### Windows
- Uses `icon.ico` (Multi-resolution format)
- Contains 256, 128, 64, 32, 16 px sizes
- PNG-based with transparency
- Shows in taskbar, start menu, and file associations

### Linux
- Uses `icon-512x512.png` (largest PNG)
- Also creates DEB package with icon
- AppImage embeds the icon

### Browser Tab
- Uses `favicon.png` (256×256 PNG)
- Displayed in browser tab
- Falls back if primary icon unavailable

## Troubleshooting

### Icons not showing in app
1. Ensure `npm run build:icons` completed successfully
2. Check that `build/icon.icns` and `build/icon.ico` exist
3. Rebuild: `rm -rf dist dist-electron && npm run build`

### "sharp" library not found
```bash
npm install --save-dev sharp
npm run build:icons
```

### macOS icon issues
- Ensure you're on macOS (iconutil is macOS-only)
- Try: `npm install --save-dev to-icns`

### Windows icon issues
- Download from online converter:
  https://anyconv.com/en/png-to-ico-converter/
- Place in `build/icon.ico`

### Electron doesn't recognize icons
- Restart development server: Stop `npm run dev` and start again
- Clear Electron cache: `rm -rf ~/Library/Caches/Electron`
- Rebuild completely: `npm run build && npm run dev`

## Customizing the Logo

To change colors or design:

1. **Edit logo.svg** with any vector editor:
   - Inkscape (free, open-source)
   - Adobe Illustrator
   - Figma
   - VS Code with SVG extension

2. **Key customization points in SVG:**
   ```xml
   <!-- Primary color (blue) -->
   <stop offset="0%" style="stop-color:#0066CC;stop-opacity:1" />

   <!-- Secondary color (darker blue) -->
   <stop offset="100%" style="stop-color:#0052A3;stop-opacity:1" />

   <!-- Accent color (cyan) -->
   <stop offset="0%" style="stop-color:#00D4FF;stop-opacity:1" />
   ```

3. **Regenerate icons:**
   ```bash
   npm run build:icons
   ```

4. **Rebuild and test:**
   ```bash
   npm run dev
   ```

## Next Steps

1. Test the app with icons:
   ```bash
   npm run dev
   ```

2. Create packages for distribution:
   ```bash
   npm run package
   ```

3. Code signing (for macOS/Windows):
   - Set up certificates
   - Update `package.json` build config
   - Re-run `npm run package`

4. Distribution:
   - Host installers on website
   - Set up auto-update mechanism
   - Publish to app stores (optional)

## Icon Specifications Reference

| Aspect | Details |
|--------|---------|
| **Logo Type** | SVG (scalable vector) |
| **Theme** | Warehouse/Inventory Management |
| **Primary Color** | Professional Blue (#0066CC) |
| **Secondary Color** | Dark Blue (#0052A3) |
| **Accent Color** | Cyan (#00D4FF) |
| **Background** | Light Gray (#F5F7FA) |
| **Format** | PNG, ICO, ICNS |
| **Sizes** | 16, 32, 64, 128, 256, 512 px |
| **Transparency** | Full alpha channel support |
| **Aspect Ratio** | 1:1 (square) |

## Additional Resources

- [Electron Icon Guidelines](https://www.electronjs.org/docs/api/native-image)
- [electron-builder Icon Docs](https://www.electron.build/icons)
- [macOS Icon Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Windows Icon Guidelines](https://learn.microsoft.com/en-us/windows/win32/menurc/about-icons)
- [PNG vs ICO vs ICNS](https://www.electron.build/icons#-on-macos)

## Support

If you encounter issues:

1. Check `ICON_SETUP.md` for detailed information
2. Review script output for error messages
3. Try a different generation method
4. Check that files exist: `ls -la build/`
5. Verify SVG is readable: Open `public/logo.svg` in browser

---

**Last Updated:** 2025-11-20
**Logo Version:** 1.0
**Status:** Ready to use
**For:** Retech Inventory Desktop Application

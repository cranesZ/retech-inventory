# Icon Setup Guide for Retech Inventory Desktop App

This guide explains how to generate and configure icons for the Retech Inventory Electron application.

## Overview

The application uses a professional warehouse/inventory-themed logo that works across multiple platforms:
- **macOS**: .icns format
- **Windows**: .ico format
- **Web/Favicon**: .png format

## Logo Design

The logo features:
- **Theme**: Warehouse shelving with inventory items and tracking elements
- **Colors**: Professional blue gradient (#0066CC to #0052A3) with cyan accents (#00D4FF)
- **Elements**:
  - Warehouse/container box representing inventory
  - Shelves with items representing product organization
  - Barcode element for scanning/tracking
  - Checkmark for completion/quality assurance
- **Scalability**: Works at all sizes from 16×16 to 512×512 pixels

## Files Structure

```
desktop/
├── public/
│   ├── logo.svg          # Main SVG source (scalable)
│   └── favicon.png       # 256×256 PNG for browser tab
├── build/
│   ├── icon-16x16.png    # Smallest icon size
│   ├── icon-32x32.png
│   ├── icon-64x64.png
│   ├── icon-128x128.png
│   ├── icon-256x256.png
│   ├── icon-512x512.png  # Largest icon size
│   ├── icon.ico          # Windows multi-resolution
│   └── icon.icns         # macOS icon bundle
├── index.html            # Updated with favicon reference
├── package.json          # Updated with build config
├── create-icons-simple.js    # Node.js icon generator
├── build-icons.sh            # Bash icon generator
├── scripts/
│   ├── generate-icons.js     # Alternative generator
│   └── generate-icons.py     # Python generator
└── ICON_SETUP.md         # This file
```

## Icon Generation Methods

Choose one of the following methods based on your system:

### Method 1: Node.js (Recommended - Cross-Platform)

**Requirements:**
```bash
npm install --save-dev sharp
```

**Optional (for .ico and .icns files):**
```bash
npm install --save-dev png-to-ico ico-convert to-icns
```

**Generate icons:**
```bash
node create-icons-simple.js
```

**What it does:**
- Generates PNG files in 6 sizes (16, 32, 64, 128, 256, 512 pixels)
- Creates favicon.png for the browser tab
- Attempts to create icon.ico for Windows
- Attempts to create icon.icns for macOS
- Provides helpful instructions for next steps

### Method 2: Bash + ImageMagick (Linux/macOS)

**Requirements:**
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Fedora
sudo dnf install ImageMagick
```

**Generate icons:**
```bash
chmod +x build-icons.sh
./build-icons.sh
```

**Features:**
- Uses ImageMagick's `convert` command
- Creates all PNG sizes
- Uses `iconutil` on macOS to create .icns
- Creates Windows .ico file
- Automatically names files correctly

### Method 3: Python + PIL/Pillow (Cross-Platform)

**Requirements:**
```bash
pip install Pillow cairosvg
```

**Generate icons:**
```bash
chmod +x scripts/generate-icons.py
python3 scripts/generate-icons.py
```

**Features:**
- Uses Python PIL for image manipulation
- Uses cairosvg for high-quality SVG rendering
- Cross-platform compatibility
- Detailed error reporting

### Method 4: Online Tools (Manual - One-Time)

If command-line tools aren't available, use these online converters:

1. **SVG to PNG conversion**:
   - [CloudConvert](https://cloudconvert.com/svg-to-png)
   - [Convertio](https://convertio.co/svg-png/)
   - [Zamzar](https://www.zamzar.com/convert/svg-to-png/)

2. **PNG to Windows ICO**:
   - [AnyConv](https://anyconv.com/en/png-to-ico-converter/)
   - [Online Convert](https://online-convert.com/convert-to-ico)

3. **PNG to macOS ICNS**:
   - On macOS, use: `iconutil -c icns icon.iconset -o icon.icns`
   - Create `icon.iconset` folder with properly named PNG files

## Configuration

### Update package.json

Add or update the `build` configuration in `package.json`:

```json
{
  "build": {
    "appId": "com.retech.inventory",
    "productName": "Retech Inventory",
    "files": [
      "dist/**/*",
      "dist-electron/**/*"
    ],
    "directories": {
      "buildResources": "build"
    },
    "mac": {
      "target": [
        "dmg",
        "zip"
      ],
      "icon": "build/icon.icns",
      "category": "public.app-category.business"
    },
    "dmg": {
      "contents": [
        {
          "x": 410,
          "y": 150,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 130,
          "y": 150,
          "type": "file"
        }
      ]
    },
    "win": {
      "target": [
        "nsis",
        "portable"
      ],
      "icon": "build/icon.ico",
      "certificateFile": null,
      "certificatePassword": null
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "linux": {
      "target": [
        "AppImage"
      ],
      "icon": "build/icon-512x512.png",
      "category": "Office"
    }
  }
}
```

### Update index.html

Replace the favicon reference in `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Retech Inventory</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Build and Package

After icons are created and configured:

```bash
# Build the application
npm run build

# Package for all platforms
npm run package

# Package for specific platform
npm run package -- --mac      # macOS only
npm run package -- --win      # Windows only
npm run package -- --linux    # Linux only
```

## Icon Files Details

### PNG Files (build/)

| Size | Usage | Platform |
|------|-------|----------|
| 16×16 | Tab/taskbar (smallest) | All |
| 32×32 | Taskbar, file associations | Windows/Linux |
| 64×64 | Larger taskbar, file browser | All |
| 128×128 | System tray, file manager | macOS, Linux |
| 256×256 | High-DPI displays, browser tab | All |
| 512×512 | Largest, Linux AppImage | All |

### Platform-Specific

**macOS (icon.icns)**
- Bundle of multiple sizes with retina (@2x) variants
- Required for App Store and notarization
- Created by `iconutil` from iconset directory
- Supports sizes: 16, 32, 64, 128, 256, 512 (and retina versions)

**Windows (icon.ico)**
- Multi-resolution embedded in single file
- Taskbar, start menu, and file associations
- Contains sizes: 256, 128, 64, 32, 16 pixels
- Standard ICO format (PNG-based for transparency)

**Web (favicon.png)**
- Browser tab icon
- Size: 256×256 pixels (browsers will scale as needed)
- PNG format with transparency support
- Served from `public/favicon.png`

## Troubleshooting

### Icons not appearing in app

1. **Check build directory**: Ensure `build/icon.icns` and `build/icon.ico` exist
2. **Rebuild application**: Clear dist folder and rebuild
   ```bash
   rm -rf dist dist-electron
   npm run build
   ```
3. **Verify package.json**: Ensure build configuration paths are correct

### Windows icon looks blurry

1. Ensure 256×256 PNG has sharp edges
2. Use PNG-based .ico file instead of BMP
3. Re-generate icons with highest quality settings

### macOS icon not updating

1. Clear Finder cache:
   ```bash
   rm -rf ~/Library/Caches/com.apple.sharedfilelist.plist
   ```
2. Force app re-index:
   ```bash
   xattr -d com.apple.FinderInfo /path/to/app
   ```
3. Rebuild and re-sign application

### .icns generation fails

On non-macOS systems, you need to:
1. Create the iconset structure manually
2. Transfer to a macOS machine
3. Run: `iconutil -c icns icon.iconset -o icon.icns`
4. Copy back to build directory

### .ico generation fails

Alternative: Use online converter
- Upload 256×256 PNG to [AnyConv PNG to ICO](https://anyconv.com/en/png-to-ico-converter/)
- Download and place in `build/icon.ico`

## Icon Customization

To modify the logo:

1. **Edit logo.svg** with any vector editor (Illustrator, Figma, Inkscape)
2. **Regenerate icons** using any of the methods above
3. **Update colors** in SVG (modify hex values in `<linearGradient>` sections)
4. **Adjust elements** (shelves, boxes, barcode, checkmark as needed)

### Common Customizations

**Change primary color** (blue):
```svg
<stop offset="0%" style="stop-color:#NEW_COLOR;stop-opacity:1" />
```

**Change accent color** (cyan):
```svg
<stop offset="0%" style="stop-color:#NEW_ACCENT;stop-opacity:1" />
```

**Add/remove elements**: Edit SVG groups with `id` attribute

## Testing Icons

### Test in macOS
```bash
# Install locally
npm run build:mac

# Check icon in Finder
ls -la ~/Downloads/Retech\ Inventory-*.dmg

# Extract and verify
open ~/Downloads/Retech\ Inventory-*.dmg
```

### Test in Windows
```bash
# Build Windows installer
npm run build:win

# Check icon in Start Menu and Add/Remove Programs
```

### Test in Linux
```bash
# Build AppImage
npm run build:linux

# Check icon in application menu
```

## Best Practices

1. **Always use PNG source**: SVGs are scalable, PNGs are derived
2. **Maintain 1:1 aspect ratio**: Icon should be square for all sizes
3. **Test at multiple sizes**: Especially 16×16 and 512×512
4. **Keep transparent backgrounds**: PNG with alpha channel
5. **Version control SVG**: Commit vector source to git
6. **Don't commit PNG icons**: Generate from SVG as needed
7. **Regular updates**: Keep icon fresh with platform design trends

## References

- [Electron Icon Guidelines](https://www.electronjs.org/docs/api/native-image)
- [macOS Icon Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Windows Icon Guidelines](https://learn.microsoft.com/en-us/windows/win32/menurc/about-icons)
- [electron-builder Documentation](https://www.electron.build/)

## Support

For issues:
1. Check error messages in console
2. Verify all source files exist
3. Try a different generation method
4. Check icon file permissions
5. Review electron-builder logs

---

**Last Updated**: 2025-11-20
**Logo Version**: 1.0
**For**: Retech Inventory Desktop Application

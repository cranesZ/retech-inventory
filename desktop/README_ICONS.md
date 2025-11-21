# Retech Inventory Icons - Quick Reference

## Current Status

✓ **Logo Created**: Professional warehouse/inventory-themed SVG
✓ **Icons Generated**: Ready for all platforms
✓ **Configuration Updated**: electron-builder configured with icon paths
✓ **Documentation Complete**: Setup guides and customization instructions

## File Overview

```
desktop/
├── public/
│   ├── logo.svg              ← Main vector logo (always editable)
│   └── favicon.png           ← Browser tab icon
├── build/                    ← Auto-generated, do not edit
│   ├── icon-16x16.png        ← Smallest
│   ├── icon-32x32.png
│   ├── icon-64x64.png
│   ├── icon-128x128.png
│   ├── icon-256x256.png
│   ├── icon-512x512.png      ← Largest
│   ├── icon.ico              ← Windows
│   └── icon.icns             ← macOS
└── package.json              ← build config with icon paths
```

## Logo Specifications at a Glance

| Property | Value |
|----------|-------|
| **Format** | SVG (scalable vector) |
| **Theme** | Modern warehouse/inventory |
| **Primary Color** | #0066CC (Blue) |
| **Secondary Color** | #0052A3 (Dark Blue) |
| **Accent Color** | #00D4FF (Cyan) |
| **Aspect Ratio** | 1:1 (Square) |
| **Transparency** | Full alpha channel |
| **Sizes Available** | 16, 32, 64, 128, 256, 512 px |

## Design Elements

1. **Warehouse Box** - Central container (blue gradient)
2. **Shelves** - Organization hierarchy (cyan gradient)
3. **Items** - Inventory products on shelves (white with details)
4. **Barcode** - Scanning/tracking element (right side)
5. **Checkmark** - Quality assurance (bottom right)

## Quick Commands

```bash
# One-time setup
npm install
npm run build:icons

# Development
npm run dev

# Production build
npm run package

# Platform-specific
npm run package:mac
npm run package:win
npm run package:linux
```

## What Each File Does

### Source File
- **logo.svg** - Edit this for color/design changes

### Generated Icons (from logo.svg)
- **icon-16x16.png** → Taskbar, status bar
- **icon-32x32.png** → File associations
- **icon-64x64.png** → File manager
- **icon-128x128.png** → macOS/Linux system icons
- **icon-256x256.png** → High-DPI displays
- **icon-512x512.png** → App store, Linux AppImage
- **favicon.png** → Browser tab (256×256 copy)
- **icon.ico** → Windows (all sizes bundled)
- **icon.icns** → macOS (all sizes + retina)

### Configuration
- **package.json** - Build settings with icon paths
- **index.html** - Favicon reference
- **SETUP_ICONS.md** - Quick setup guide
- **ICON_SETUP.md** - Comprehensive documentation

## Icon Generation Scripts

Choose based on your system:

### Recommended: Node.js
```bash
npm run build:icons
```
✓ Cross-platform ✓ No system dependencies ✓ Fast

### Alternative: Bash + ImageMagick
```bash
brew install imagemagick  # macOS
./build-icons.sh
```
✓ Native tools ✓ Good quality

### Alternative: Python
```bash
pip install Pillow cairosvg
python3 scripts/generate-icons.py
```
✓ High-quality SVG rendering

## Color Palette

### Primary Colors
```
Primary Blue:     #0066CC (rgb(0, 102, 204))
Dark Blue:        #0052A3 (rgb(0, 82, 163))
Cyan Accent:      #00D4FF (rgb(0, 212, 255))
Dark Cyan:        #0099CC (rgb(0, 153, 204))
```

### Usage
- **Primary**: Main box, logo outline
- **Dark**: Shadows, depth
- **Cyan**: Shelves, accents
- **Background**: Light gray (#F5F7FA)

## Customization Quick Tips

### Change Primary Color
1. Edit `public/logo.svg`
2. Find: `<stop offset="0%" style="stop-color:#0066CC`
3. Replace `#0066CC` with new color
4. Run: `npm run build:icons`

### Change Accent Color
1. Edit `public/logo.svg`
2. Find: `<stop offset="0%" style="stop-color:#00D4FF`
3. Replace `#00D4FF` with new color
4. Run: `npm run build:icons`

### Remove Text
1. Delete lines with `<text>` tags in logo.svg
2. Run: `npm run build:icons`

### Adjust Size/Position
1. Edit SVG viewBox or element coordinates
2. Use values 0-512 (standard size)
3. Run: `npm run build:icons`

## Platform Details

### macOS (.icns)
- Contains: 16, 32, 64, 128, 256, 512 px + retina (@2x)
- Location: Finder, Dock, Launchpad
- Creation: `iconutil` command or `to-icns` npm package
- Notarization: Required for App Store

### Windows (.ico)
- Contains: 256, 128, 64, 32, 16 px (bundled)
- Location: Taskbar, Start menu, file associations
- Format: PNG-based with transparency
- Creation: ImageMagick, png-to-ico, or online tools

### Linux (PNG)
- Uses: icon-512x512.png
- Location: Application menu, desktop
- AppImage: Embeds icon automatically
- DEB: Icon configured in package

### Web (PNG)
- Uses: favicon.png (256×256)
- Location: Browser tab, bookmarks
- Format: PNG with transparency
- Browsers: Auto-scale as needed

## Testing Checklist

- [ ] Icons display in development (`npm run dev`)
- [ ] Favicon shows in browser tab
- [ ] Icons sharp at 16×16 (smallest)
- [ ] Icons clear at 512×512 (largest)
- [ ] Colors match specification
- [ ] Platform builds include icons:
  - [ ] macOS .dmg shows icon in Finder
  - [ ] Windows .exe shows icon in explorer
  - [ ] Linux AppImage has icon in menu
- [ ] After update, icon persists

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Icons not showing | `npm run build:icons && npm run dev` |
| Blurry at 16×16 | Regenerate or edit SVG to be simpler |
| Wrong on Windows | Verify `build/icon.ico` exists |
| Missing on macOS | Create or verify `build/icon.icns` |
| Favicon not updating | Hard refresh (Cmd+Shift+R) |

## File Size Reference

Expected sizes after generation:

```
icon-16x16.png    ~  0.5 KB
icon-32x32.png    ~  1.0 KB
icon-64x64.png    ~  2.0 KB
icon-128x128.png  ~  4.0 KB
icon-256x256.png  ~  8.0 KB
icon-512x512.png  ~ 20.0 KB
favicon.png       ~  8.0 KB
icon.ico          ~ 30.0 KB (bundled)
icon.icns         ~ 50.0 KB (bundled + retina)
```

## CI/CD Integration

For automated icon generation in CI/CD:

```bash
# In your GitHub Actions workflow
- name: Generate Icons
  run: npm run build:icons

- name: Build Packages
  run: npm run package
```

Icons will be generated fresh on every build.

## Version Control

**Commit:**
- `public/logo.svg` (source)
- Icon scripts in `scripts/` and root
- Documentation files

**Don't Commit:**
- Generated PNG files in `build/`
- `.icns` and `.ico` files
- Regenerate from SVG as needed

## Links & Resources

- **Setup Guide**: `SETUP_ICONS.md`
- **Full Documentation**: `ICON_SETUP.md`
- **Design Summary**: `../LOGO_DESIGN_SUMMARY.md`
- **electron-builder**: https://www.electron.build/
- **Icon Guidelines**: https://developer.apple.com/design/

## Summary

The Retech Inventory logo is a professional, scalable design featuring a modern warehouse theme. It's ready to use immediately and fully customizable. Generate icons once with `npm run build:icons`, then build and distribute!

---

**Created:** 2025-11-20
**Logo Version:** 1.0
**Status:** Production Ready

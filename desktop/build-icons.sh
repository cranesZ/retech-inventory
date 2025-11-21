#!/bin/bash

# Build icons for Retech Inventory Desktop App
# This script converts the SVG logo to PNG icons in multiple sizes
# and creates macOS .icns and Windows .ico files

set -e

# Directories
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
PUBLIC_DIR="$PROJECT_ROOT/public"
BUILD_DIR="$PROJECT_ROOT/build"
ICON_SET_DIR="$BUILD_DIR/icon.iconset"

# Create directories
mkdir -p "$BUILD_DIR"
mkdir -p "$ICON_SET_DIR"

SVG_SOURCE="$PUBLIC_DIR/logo.svg"

echo "Building Retech Inventory icons..."
echo "Source: $SVG_SOURCE"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Install it using: brew install imagemagick"
    exit 1
fi

# Convert SVG to PNG in multiple sizes
echo "Creating PNG icons..."

sizes=(16 32 64 128 256 512)

for size in "${sizes[@]}"; do
    output_file="$BUILD_DIR/icon-${size}x${size}.png"
    convert -background none -size ${size}x${size} "$SVG_SOURCE" "$output_file"
    echo "  ✓ Created $size×$size PNG"
done

# Create icon for favicon (256x256)
convert -background none -size 256x256 "$SVG_SOURCE" "$PUBLIC_DIR/favicon.png"
echo "  ✓ Created favicon.png"

# macOS .icns file preparation (using iconset)
echo ""
echo "Creating macOS .icns file..."

# Create iconset for different sizes and scales
cp "$BUILD_DIR/icon-16x16.png" "$ICON_SET_DIR/icon_16x16.png"
cp "$BUILD_DIR/icon-32x32.png" "$ICON_SET_DIR/icon_32x32.png"
cp "$BUILD_DIR/icon-64x64.png" "$ICON_SET_DIR/icon_64x64.png"
cp "$BUILD_DIR/icon-128x128.png" "$ICON_SET_DIR/icon_128x128.png"
cp "$BUILD_DIR/icon-256x256.png" "$ICON_SET_DIR/icon_256x256.png"
cp "$BUILD_DIR/icon-512x512.png" "$ICON_SET_DIR/icon_512x512.png"

# Create retina versions (2x)
for size in 16 32 64 128 256; do
    size2=$((size * 2))
    input_file="$BUILD_DIR/icon-${size2}x${size2}.png"
    output_file="$ICON_SET_DIR/icon_${size}x${size}@2x.png"
    if [ -f "$input_file" ]; then
        cp "$input_file" "$output_file"
    fi
done

# Create 512x512@2x (from 1024x1024, we'll use 512x512 twice)
cp "$BUILD_DIR/icon-512x512.png" "$ICON_SET_DIR/icon_512x512@2x.png"

# Convert iconset to .icns
if command -v iconutil &> /dev/null; then
    iconutil -c icns "$ICON_SET_DIR" -o "$BUILD_DIR/icon.icns"
    echo "  ✓ Created icon.icns"
else
    echo "  ⚠ iconutil not found (macOS required for .icns generation)"
    echo "  You can create it manually on macOS or skip this step"
fi

# Create Windows .ico file
echo ""
echo "Creating Windows .ico file..."

# ImageMagick convert to create a multi-resolution ICO
convert "$BUILD_DIR/icon-256x256.png" \
        "$BUILD_DIR/icon-128x128.png" \
        "$BUILD_DIR/icon-64x64.png" \
        "$BUILD_DIR/icon-32x32.png" \
        "$BUILD_DIR/icon-16x16.png" \
        "$BUILD_DIR/icon.ico"

echo "  ✓ Created icon.ico"

# Clean up iconset directory
rm -rf "$ICON_SET_DIR"

echo ""
echo "Icon generation complete!"
echo ""
echo "Generated files:"
ls -lh "$BUILD_DIR"/ | grep -E '\.(png|icns|ico)$' || true
echo ""
echo "Next steps:"
echo "1. Update electron-builder configuration in package.json"
echo "2. Update favicon reference in index.html"
echo "3. Run: npm run package"

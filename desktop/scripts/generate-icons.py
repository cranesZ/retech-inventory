#!/usr/bin/env python3
"""
Icon Generation Script for Retech Inventory
Converts SVG logo to PNG icons in multiple sizes
Requires: Pillow, cairosvg (for SVG rendering)
"""

import os
import sys
from pathlib import Path

def install_dependencies():
    """Check and install required packages"""
    required = ['PIL', 'cairosvg']
    missing = []

    for package in required:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)

    if missing:
        print(f"Error: Missing required packages: {', '.join(missing)}")
        print("\nInstall them using:")
        print("  pip install Pillow cairosvg")
        return False
    return True

def generate_icons():
    """Generate all required icon files"""
    from PIL import Image
    import io

    try:
        import cairosvg
    except ImportError:
        cairosvg = None

    # Setup paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    public_dir = project_root / 'public'
    build_dir = project_root / 'build'
    svg_source = public_dir / 'logo.svg'

    # Create directories
    build_dir.mkdir(exist_ok=True)
    (build_dir / 'icon.iconset').mkdir(exist_ok=True)

    if not svg_source.exists():
        print(f"Error: SVG source not found: {svg_source}")
        return False

    print("Building Retech Inventory icons...")
    print(f"Source: {svg_source}")
    print()

    # Sizes for different platforms
    sizes = [16, 32, 64, 128, 256, 512]
    png_files = {}

    print("Creating PNG icons...")

    # Convert SVG to PNG for each size
    for size in sizes:
        output_file = build_dir / f'icon-{size}x{size}.png'

        if cairosvg:
            try:
                # Use cairosvg to render SVG with transparency
                png_data = cairosvg.svg2png(
                    url=str(svg_source),
                    write_to=None,
                    output_width=size,
                    output_height=size,
                )
                with open(output_file, 'wb') as f:
                    f.write(png_data)
                png_files[size] = output_file
                print(f"  ✓ Created {size}×{size} PNG")
            except Exception as e:
                print(f"  ✗ Failed to create {size}×{size} PNG: {e}")
        else:
            print(f"  ⚠ Skipping {size}×{size} (cairosvg not available)")

    if not png_files:
        print("\nError: Could not generate any PNG files")
        return False

    # Create favicon
    print()
    print("Creating favicon...")
    favicon_path = public_dir / 'favicon.png'
    if 256 in png_files:
        Image.open(png_files[256]).save(favicon_path)
        print(f"  ✓ Created favicon.png")

    # Create Windows ICO file
    print()
    print("Creating Windows .ico file...")
    try:
        ico_sizes = [256, 128, 64, 32, 16]
        images = []
        for size in ico_sizes:
            if size in png_files:
                img = Image.open(png_files[size])
                images.append(img)

        if images:
            # Save as ICO (first image is primary)
            images[0].save(
                build_dir / 'icon.ico',
                format='ICO',
                sizes=[(img.width, img.height) for img in images]
            )
            print(f"  ✓ Created icon.ico")
    except Exception as e:
        print(f"  ⚠ Could not create .ico file: {e}")

    # Create macOS ICNS structure (requires iconutil on macOS)
    print()
    print("Creating macOS .icns file structure...")
    try:
        import subprocess

        iconset_dir = build_dir / 'icon.iconset'

        # Copy PNGs to iconset with proper naming
        copy_pairs = [
            (16, 'icon_16x16.png'),
            (32, 'icon_32x32.png'),
            (64, 'icon_64x64.png'),
            (128, 'icon_128x128.png'),
            (256, 'icon_256x256.png'),
            (512, 'icon_512x512.png'),
        ]

        for size, name in copy_pairs:
            if size in png_files:
                src = png_files[size]
                dst = iconset_dir / name
                os.system(f'cp "{src}" "{dst}"')

        # Create retina versions (@2x)
        retina_pairs = [
            (32, 16, 'icon_16x16@2x.png'),
            (64, 32, 'icon_32x32@2x.png'),
            (128, 64, 'icon_64x64@2x.png'),
            (256, 128, 'icon_128x128@2x.png'),
            (512, 256, 'icon_256x256@2x.png'),
        ]

        for src_size, _, name in retina_pairs:
            if src_size in png_files:
                src = png_files[src_size]
                dst = iconset_dir / name
                os.system(f'cp "{src}" "{dst}"')

        # Try to convert to ICNS using iconutil (macOS only)
        try:
            subprocess.run(
                ['iconutil', '-c', 'icns', str(iconset_dir), '-o', str(build_dir / 'icon.icns')],
                check=True,
                capture_output=True
            )
            print(f"  ✓ Created icon.icns")

            # Clean up iconset directory
            os.system(f'rm -rf "{iconset_dir}"')
        except (FileNotFoundError, subprocess.CalledProcessError):
            print(f"  ⚠ iconutil not found (macOS required)")
            print(f"     Iconset prepared at: {iconset_dir}")
            print(f"     Run on macOS: iconutil -c icns {iconset_dir} -o {build_dir / 'icon.icns'}")

    except Exception as e:
        print(f"  ⚠ Could not create .icns structure: {e}")

    # Summary
    print()
    print("Icon generation complete!")
    print()
    print("Generated files:")
    for file in sorted(build_dir.glob('*.[pP][nN][gG]')):
        size = os.path.getsize(file)
        print(f"  {file.name} ({size:,} bytes)")
    for file in sorted(build_dir.glob('*.[iI][cC][oO]')):
        size = os.path.getsize(file)
        print(f"  {file.name} ({size:,} bytes)")
    for file in sorted(build_dir.glob('*.[iI][cC][nN][sS]')):
        size = os.path.getsize(file)
        print(f"  {file.name} ({size:,} bytes)")

    print()
    print("Next steps:")
    print("1. Update electron-builder configuration in package.json")
    print("2. Update favicon reference in index.html")
    print("3. Run: npm run package")

    return True

if __name__ == '__main__':
    if not install_dependencies():
        sys.exit(1)

    if not generate_icons():
        sys.exit(1)

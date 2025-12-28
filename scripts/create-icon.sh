#!/bin/bash

# Create macOS .icns icon from SVG

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SVG_FILE="${PROJECT_DIR}/public/app-icon.svg"
ICONSET_DIR="${PROJECT_DIR}/AppIcon.iconset"
ICNS_FILE="/Applications/GitHub Dashboard.app/Contents/Resources/AppIcon.icns"

echo "Creating icon from SVG..."

# Create iconset directory
mkdir -p "$ICONSET_DIR"

# Convert SVG to PNG at various sizes using sips (requires rsvg-convert or similar)
# Using qlmanage as fallback for SVG to PNG conversion

# First, let's create a high-res PNG from the SVG
# We'll use a simple approach with built-in tools

# Create PNGs at required sizes
for SIZE in 16 32 64 128 256 512 1024; do
    # Use qlmanage to render SVG (macOS built-in)
    qlmanage -t -s $SIZE -o "$ICONSET_DIR" "$SVG_FILE" 2>/dev/null
    
    if [ -f "${ICONSET_DIR}/app-icon.svg.png" ]; then
        if [ $SIZE -eq 1024 ]; then
            mv "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_512x512@2x.png"
        elif [ $SIZE -eq 512 ]; then
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_512x512.png"
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_256x256@2x.png"
        elif [ $SIZE -eq 256 ]; then
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_256x256.png"
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_128x128@2x.png"
        elif [ $SIZE -eq 128 ]; then
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_128x128.png"
        elif [ $SIZE -eq 64 ]; then
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_32x32@2x.png"
        elif [ $SIZE -eq 32 ]; then
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_32x32.png"
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_16x16@2x.png"
        elif [ $SIZE -eq 16 ]; then
            cp "${ICONSET_DIR}/app-icon.svg.png" "${ICONSET_DIR}/icon_16x16.png"
        fi
        rm -f "${ICONSET_DIR}/app-icon.svg.png"
    fi
done

# Convert iconset to icns
if [ -d "$ICONSET_DIR" ] && [ "$(ls -A $ICONSET_DIR)" ]; then
    iconutil -c icns "$ICONSET_DIR" -o "$ICNS_FILE"
    echo "✅ Icon created at: $ICNS_FILE"
else
    echo "⚠️  Could not create icon PNGs. Creating a simple fallback..."
    
    # Fallback: create a simple colored square icon
    # Using sips to create a basic icon
    mkdir -p "$ICONSET_DIR"
    
    # Create a simple 512x512 PNG with ImageMagick if available, or skip
    if command -v convert &> /dev/null; then
        convert -size 512x512 xc:white -fill black -draw "roundrectangle 20,20 492,492 40,40" \
                -fill black -draw "rectangle 100,150 180,230" \
                -fill white -draw "rectangle 200,150 280,230" \
                "${ICONSET_DIR}/icon_512x512.png"
        iconutil -c icns "$ICONSET_DIR" -o "$ICNS_FILE" 2>/dev/null
    fi
fi

# Cleanup
rm -rf "$ICONSET_DIR"

echo "Done! Restart the app to see the new icon."

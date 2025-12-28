#!/bin/bash

# Create macOS app bundle for GitHub Dashboard

APP_NAME="GitHub Dashboard"
APP_DIR="/Applications/${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Creating ${APP_NAME}.app..."

# Create directory structure
mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}"

# Create the launcher script
cat > "${MACOS_DIR}/launcher" << 'LAUNCHER'
#!/bin/bash

PROJECT_DIR="/Users/bertrand/Sites/github-dashboard-visualizer"
LOG_FILE="/tmp/github-dashboard.log"

cd "$PROJECT_DIR"

# Check common ports for running instance
for PORT in 3000 3001 3333 3334 3335; do
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        echo "Found running instance on port $PORT"
        open "http://localhost:$PORT"
        exit 0
    fi
done

# No running instance found, start on port 3333
PORT=3333

# Make sure port 3333 is free
if lsof -i :$PORT > /dev/null 2>&1; then
    # Port busy but not responding, try next
    PORT=3334
fi

echo "Starting server on port $PORT..."
npm run start -- -p $PORT > "$LOG_FILE" 2>&1 &

# Wait for server to be ready
echo "Waiting for server..."
for i in {1..30}; do
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        echo "Server ready!"
        open "http://localhost:$PORT"
        exit 0
    fi
    sleep 1
done

echo "Server failed to start. Check $LOG_FILE"
open "$LOG_FILE"
LAUNCHER

chmod +x "${MACOS_DIR}/launcher"

# Create Info.plist
cat > "${CONTENTS_DIR}/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.github-dashboard.app</string>
    <key>CFBundleName</key>
    <string>GitHub Dashboard</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

# Create a simple icon (you can replace this with a real .icns file)
# For now, we'll use a placeholder
echo "Note: Add your own AppIcon.icns to ${RESOURCES_DIR}/"

# Build the Next.js app first
echo "Building Next.js app..."
cd "$PROJECT_DIR"
npm run build

echo ""
echo "✅ App created at: ${APP_DIR}"
echo ""
echo "To use:"
echo "1. Double-click '${APP_NAME}' in Applications"
echo "2. Or drag it to your Dock"
echo ""
echo "Optional: Add a custom icon by placing AppIcon.icns in:"
echo "  ${RESOURCES_DIR}/"

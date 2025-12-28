const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const size = 1024;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// White background
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.roundRect(0, 0, size, size, 200);
ctx.fill();

// Green border (GitHub style)
ctx.strokeStyle = '#40c463';
ctx.lineWidth = 30;
ctx.beginPath();
ctx.roundRect(40, 40, size - 80, size - 80, 180);
ctx.stroke();

// Grid settings
const gridStartX = 150;
const gridStartY = 280;
const cellSize = 80;
const gap = 20;

// GitHub contribution colors (from light to dark green)
const greenColors = ['#9be9a8', '#40c463', '#30a14e', '#216e39'];

// Pattern: 0-3 = intensity level (0=lightest, 3=darkest), -1 = empty/outline
const pattern = [
  [-1, 2, 0, 3, 1, -1, 2],
  [1, -1, 3, 0, 2, 1, -1],
  [-1, 1, 2, 3, -1, 2, 1],
  [3, 2, -1, 1, 3, -1, 2],
];

for (let row = 0; row < pattern.length; row++) {
  for (let col = 0; col < pattern[row].length; col++) {
    const x = gridStartX + col * (cellSize + gap);
    const y = gridStartY + row * (cellSize + gap);
    const intensity = pattern[row][col];
    
    ctx.beginPath();
    ctx.roundRect(x, y, cellSize, cellSize, 12);
    
    if (intensity >= 0) {
      ctx.fillStyle = greenColors[intensity];
      ctx.fill();
    } else {
      ctx.strokeStyle = '#9be9a8';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  }
}

// Save PNG
const pngPath = '/tmp/app_icon_1024.png';
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(pngPath, buffer);
console.log('Created:', pngPath);

// Create iconset
const iconsetDir = '/tmp/AppIcon.iconset';
if (!fs.existsSync(iconsetDir)) {
  fs.mkdirSync(iconsetDir);
}

// Generate different sizes
const sizes = [
  { name: 'icon_16x16.png', size: 16 },
  { name: 'icon_16x16@2x.png', size: 32 },
  { name: 'icon_32x32.png', size: 32 },
  { name: 'icon_32x32@2x.png', size: 64 },
  { name: 'icon_128x128.png', size: 128 },
  { name: 'icon_128x128@2x.png', size: 256 },
  { name: 'icon_256x256.png', size: 256 },
  { name: 'icon_256x256@2x.png', size: 512 },
  { name: 'icon_512x512.png', size: 512 },
  { name: 'icon_512x512@2x.png', size: 1024 },
];

for (const { name, size: s } of sizes) {
  const resizedCanvas = createCanvas(s, s);
  const resizedCtx = resizedCanvas.getContext('2d');
  
  // Redraw at new size
  const scale = s / size;
  
  // White background
  resizedCtx.fillStyle = '#ffffff';
  resizedCtx.beginPath();
  resizedCtx.roundRect(0, 0, s, s, 200 * scale);
  resizedCtx.fill();
  
  // Green border (GitHub style)
  resizedCtx.strokeStyle = '#40c463';
  resizedCtx.lineWidth = 30 * scale;
  resizedCtx.beginPath();
  resizedCtx.roundRect(40 * scale, 40 * scale, s - 80 * scale, s - 80 * scale, 180 * scale);
  resizedCtx.stroke();
  
  // Grid
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      const x = (gridStartX + col * (cellSize + gap)) * scale;
      const y = (gridStartY + row * (cellSize + gap)) * scale;
      const cs = cellSize * scale;
      const intensity = pattern[row][col];
      
      resizedCtx.beginPath();
      resizedCtx.roundRect(x, y, cs, cs, 12 * scale);
      
      if (intensity >= 0) {
        resizedCtx.fillStyle = greenColors[intensity];
        resizedCtx.fill();
      } else {
        resizedCtx.strokeStyle = '#9be9a8';
        resizedCtx.lineWidth = 6 * scale;
        resizedCtx.stroke();
      }
    }
  }
  
  const resizedBuffer = resizedCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsetDir, name), resizedBuffer);
}

console.log('Created iconset at:', iconsetDir);

// Convert to icns
const icnsPath = '/Applications/GitHub Dashboard.app/Contents/Resources/AppIcon.icns';
try {
  execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`);
  console.log('Created icns at:', icnsPath);
} catch (e) {
  console.error('Failed to create icns:', e.message);
}

// Cleanup
fs.rmSync(iconsetDir, { recursive: true });
console.log('Done!');

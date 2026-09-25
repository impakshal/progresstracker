const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to compute CRC32 for PNG chunks
function createCrcTable() {
  const cTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    cTable[n] = c;
  }
  return cTable;
}
const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function generatePngIcon(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Raw RGBA scanlines: (width * 4 + 1) * height bytes
  const rawData = Buffer.alloc((width * 4 + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = isMaskable ? width * 0.48 : width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: Gradient from #2563eb (brand primary) to #1d4ed8
      const gradientFactor = y / height;
      let r = Math.round(37 * (1 - gradientFactor) + 29 * gradientFactor);
      let g = Math.round(99 * (1 - gradientFactor) + 78 * gradientFactor);
      let b = Math.round(235 * (1 - gradientFactor) + 216 * gradientFactor);
      let a = 255;

      // Maskable icons fill entire square; standard icons have smooth rounded corners
      if (!isMaskable) {
        const cornerRadius = width * 0.22;
        // Rounded rectangle test
        const qx = Math.abs(x - cx) - (width / 2 - cornerRadius);
        const qy = Math.abs(y - cy) - (height / 2 - cornerRadius);
        const cornerDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
        if (cornerDist > cornerRadius) {
          a = 0; // Transparent background outside rounded corner
        }
      }

      if (a > 0) {
        // Draw ascending trend graph SVG icon: points (23 6 13.5 15.5 8.5 10.5 1 18) and arrowhead (17 6 23 6 23 12)
        // Scaled to icon dimensions
        const margin = width * 0.26;
        const drawW = width - margin * 2;
        const drawH = height - margin * 2;

        const mapX = (val) => margin + (val / 24) * drawW;
        const mapY = (val) => margin + (val / 24) * drawH;

        // Line segments: (1,18)-(8.5,10.5), (8.5,10.5)-(13.5,15.5), (13.5,15.5)-(23,6), (17,6)-(23,6), (23,6)-(23,12)
        const lineSegs = [
          [mapX(1), mapY(18), mapX(8.5), mapY(10.5)],
          [mapX(8.5), mapY(10.5), mapX(13.5), mapY(15.5)],
          [mapX(13.5), mapY(15.5), mapX(23), mapY(6)],
          [mapX(17), mapY(6), mapX(23), mapY(6)],
          [mapX(23), mapY(6), mapX(23), mapY(12)],
        ];

        const strokeWidth = width * 0.075;

        // Check if pixel (x,y) is near any line segment
        let isGraphPixel = false;
        for (const [x1, y1, x2, y2] of lineSegs) {
          const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
          let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = x1 + t * (x2 - x1);
          const projY = y1 + t * (y2 - y1);
          const d = Math.hypot(x - projX, y - projY);

          if (d <= strokeWidth / 2) {
            isGraphPixel = true;
            break;
          }
        }

        if (isGraphPixel) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Header
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createPngChunk('IHDR', ihdr);

  // Compress image data
  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createPngChunk('IDAT', deflated);

  // End chunk
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Write icons
const icon192 = generatePngIcon(192, false);
fs.writeFileSync(path.join(__dirname, '..', 'icon-192.png'), icon192);

const icon512 = generatePngIcon(512, false);
fs.writeFileSync(path.join(__dirname, '..', 'icon-512.png'), icon512);

const iconMaskable512 = generatePngIcon(512, true);
fs.writeFileSync(path.join(__dirname, '..', 'icon-maskable-512.png'), iconMaskable512);

console.log('✅ Generated icon-192.png, icon-512.png, icon-maskable-512.png successfully!');

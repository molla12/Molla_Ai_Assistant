import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function renderPng(size, maskable = false) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc((width * 4 + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = width * (maskable ? 0.38 : 0.46);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base background: #07090e -> #140b18
      let r = 10 + Math.floor((x / width) * 12);
      let g = 12 + Math.floor((y / height) * 6);
      let b = 22 + Math.floor(((x + y) / (width * 2)) * 14);
      let a = 255;

      if (!maskable) {
        // Rounded corner badge (squircle)
        const cornerR = width * 0.22;
        const qx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
        const qy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
        const qDist = Math.sqrt(qx * qx + qy * qy);
        if (qDist > cornerR) {
          a = 0;
        } else if (qDist > cornerR - 2) {
          a = Math.floor(255 * (1 - (qDist - (cornerR - 2)) / 2));
        }
      }

      if (a > 0) {
        // Outer halo glow
        if (dist < maxRadius * 1.35 && dist >= maxRadius * 0.8) {
          const glowIntensity = Math.sin(((maxRadius * 1.35 - dist) / (maxRadius * 0.55)) * (Math.PI / 2));
          r = Math.min(255, r + Math.floor(180 * glowIntensity));
          g = Math.min(255, g + Math.floor(30 * glowIntensity));
          b = Math.min(255, b + Math.floor(90 * glowIntensity));
        }

        // Outer neon ring
        if (Math.abs(dist - maxRadius * 0.85) < 3.5) {
          r = 244; g = 63; b = 94; // rose-500
        } else if (Math.abs(dist - maxRadius * 0.7) < 2.5) {
          r = 6; g = 182; b = 212; // cyan-500
        }

        // Glowing core orb
        const coreR = maxRadius * 0.48;
        if (dist < coreR) {
          const norm = dist / coreR;
          r = Math.min(255, Math.floor(255 * (1 - norm * 0.4) + 244 * (norm * 0.4)));
          g = Math.min(255, Math.floor(220 * (1 - norm) + 63 * norm));
          b = Math.min(255, Math.floor(230 * (1 - norm) + 94 * norm));

          // Center bright sparkle
          if (dist < coreR * 0.25) {
            r = 255; g = 255; b = 255;
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), renderPng(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), renderPng(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), renderPng(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderPng(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), renderPng(64, false));

console.log('✅ Generated PWA icons successfully in public/ directory');

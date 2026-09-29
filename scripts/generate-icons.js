import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SAHAYA SVG Icon (Shield + Beacon + Protective hand)
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#9F1239" />
    </linearGradient>
    <linearGradient id="shieldGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#FDE047" stop-opacity="0.9" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>
  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  
  <!-- Outer emergency pulse ring -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="8" stroke-dasharray="16 12" />
  
  <!-- Central Shield -->
  <g filter="url(#shadow)">
    <path d="M256 90 L380 145 C380 270 256 385 256 385 C256 385 132 270 132 145 Z" fill="url(#shieldGlow)" />
  </g>
  
  <!-- Inner Emblem: Life Line / Compassionate Star / Emergency Cross -->
  <g fill="#BE123C">
    <!-- Center SOS Beacon / Heart Star -->
    <path d="M256 160 C264 160 272 168 272 180 L272 230 L322 230 C334 230 342 238 342 246 C342 254 334 262 322 262 L272 262 L272 312 C272 324 264 332 256 332 C248 332 240 324 240 312 L240 262 L190 262 C178 262 170 254 170 246 C170 238 178 230 190 230 L240 230 L240 180 C240 168 248 160 256 160 Z" />
    <circle cx="256" cy="246" r="18" fill="#FFFFFF" />
    <circle cx="256" cy="246" r="8" fill="#E11D48" />
  </g>
  
  <!-- Bottom Brand Text -->
  <text x="256" y="445" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">SAHAYA</text>
</svg>`;

// Maskable icon with safe zone padding (80% safe zone)
const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#9F1239" />
    </linearGradient>
    <linearGradient id="shieldGlowMask" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#FDE047" stop-opacity="0.9" />
    </linearGradient>
  </defs>
  <!-- Full bleed background for maskable -->
  <rect width="512" height="512" fill="url(#bgMask)" />
  
  <!-- Content scaled inside 80% safe zone (center 410px) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <g filter="url(#shadow)">
      <path d="M256 90 L380 145 C380 270 256 385 256 385 C256 385 132 270 132 145 Z" fill="url(#shieldGlowMask)" />
    </g>
    <g fill="#BE123C">
      <path d="M256 160 C264 160 272 168 272 180 L272 230 L322 230 C334 230 342 238 342 246 C342 254 334 262 322 262 L272 262 L272 312 C272 324 264 332 256 332 C248 332 240 324 240 312 L240 262 L190 262 C178 262 170 254 170 246 C170 238 178 230 190 230 L240 230 L240 180 C240 168 248 160 256 160 Z" />
      <circle cx="256" cy="246" r="18" fill="#FFFFFF" />
      <circle cx="256" cy="246" r="8" fill="#E11D48" />
    </g>
    <text x="256" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">SAHAYA</text>
  </g>
</svg>`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
  console.log('Wrote public/icon.svg');

  const buf = Buffer.from(svgIcon);
  const maskableBuf = Buffer.from(svgMaskable);

  await sharp(buf).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Wrote public/pwa-192x192.png');

  await sharp(buf).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Wrote public/pwa-512x512.png');

  await sharp(maskableBuf).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Wrote public/pwa-maskable-512x512.png');

  await sharp(buf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Wrote public/apple-touch-icon.png');

  await sharp(buf).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Wrote public/favicon.ico');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});

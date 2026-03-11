/**
 * Icon generator for Budget Tracker
 * Run: node generate-icons.js
 *
 * Generates:
 *  assets/icon.png          — 1024x1024  (app store / home screen)
 *  assets/adaptive-icon.png — 1024x1024  (Android adaptive, transparent bg)
 *  assets/splash-icon.png   — 512x512    (center logo for native splash)
 *  assets/favicon.png       — 64x64      (web browser tab)
 */

const { execSync } = require("child_process");

// Install canvas if missing
try {
  require.resolve("canvas");
} catch {
  console.log("Installing canvas...");
  execSync("npm install canvas --save-dev", { stdio: "inherit" });
}

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "assets");

// ── Design tokens ────────────────────────────────────────────────────────────
const PURPLE_DARK  = "#7c3aed";
const PURPLE_MID   = "#8b5cf6";
const PURPLE_LIGHT = "#a78bfa";
const WHITE        = "#ffffff";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeGradient(ctx, size) {
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0,   PURPLE_DARK);
  g.addColorStop(0.5, PURPLE_MID);
  g.addColorStop(1,   PURPLE_LIGHT);
  return g;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws a wallet icon centered in the canvas.
 *   s  = canvas size
 *   wf = wallet scale factor (0–1 relative to canvas)
 *   color = stroke/fill color
 */
function drawWallet(ctx, s, wf, color) {
  const w  = s * wf;        // wallet width
  const h  = w * 0.65;      // wallet height
  const x  = (s - w) / 2;
  const y  = (s - h) / 2;
  const r  = w * 0.08;      // corner radius
  const lw = w * 0.045;     // line width

  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = lw;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";

  // Body
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();

  // Top flap (slightly darker via opacity)
  const flapH = h * 0.28;
  roundRect(ctx, x, y, w, flapH, r);
  ctx.globalAlpha = 0.25;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();

  // Horizontal divider between flap and body
  ctx.beginPath();
  ctx.moveTo(x + lw / 2, y + flapH);
  ctx.lineTo(x + w - lw / 2, y + flapH);
  ctx.stroke();

  // Coin slot (small rectangle on the right side of body)
  const slotW = w * 0.22;
  const slotH = h * 0.28;
  const slotX = x + w - slotW - w * 0.06;
  const slotY = y + flapH + (h - flapH - slotH) / 2;
  roundRect(ctx, slotX, slotY, slotW, slotH, slotH * 0.4);
  ctx.globalAlpha = 0.3;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();

  // Coin dot inside slot
  const dotR = slotH * 0.22;
  ctx.beginPath();
  ctx.arc(slotX + slotW / 2, slotY + slotH / 2, dotR, 0, Math.PI * 2);
  ctx.fill();
}

// ── Generators ────────────────────────────────────────────────────────────────

/** icon.png — rounded-square gradient background + white wallet */
function generateIcon(size, outPath) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext("2d");
  const radius = size * 0.22;

  // Rounded-square background
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fillStyle = makeGradient(ctx, size);
  ctx.fill();

  // Subtle inner glow
  const glow = ctx.createRadialGradient(size * 0.38, size * 0.32, 0, size / 2, size / 2, size * 0.6);
  glow.addColorStop(0, "rgba(255,255,255,0.18)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fillStyle = glow;
  ctx.fill();

  // Wallet
  drawWallet(ctx, size, 0.52, WHITE);

  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log(`✓ ${path.basename(outPath)} (${size}×${size})`);
}

/** adaptive-icon.png — transparent background, white wallet centered */
function generateAdaptiveIcon(size, outPath) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext("2d");

  // Transparent — Android will apply its own background color (set in app.json)
  ctx.clearRect(0, 0, size, size);

  // White wallet, slightly smaller to fit Android safe zone (66% of icon)
  drawWallet(ctx, size, 0.42, WHITE);

  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log(`✓ ${path.basename(outPath)} (${size}×${size})`);
}

/** splash-icon.png — just the logo mark (no background; app.json sets the bg color) */
function generateSplashIcon(size, outPath) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext("2d");

  // White circle card
  const cardSize = size * 0.65;
  const cardX    = (size - cardSize) / 2;
  const cardY    = (size - cardSize) / 2;

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, cardSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = WHITE;
  ctx.fill();

  // Purple wallet inside the circle
  drawWallet(ctx, size, 0.38, PURPLE_MID);

  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log(`✓ ${path.basename(outPath)} (${size}×${size})`);
}

/** favicon.png — tiny rounded square */
function generateFavicon(size, outPath) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext("2d");
  const radius = size * 0.2;

  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fillStyle = makeGradient(ctx, size);
  ctx.fill();

  drawWallet(ctx, size, 0.56, WHITE);

  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log(`✓ ${path.basename(outPath)} (${size}×${size})`);
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log("\nGenerating icons...\n");

generateIcon(1024,         path.join(ASSETS, "icon.png"));
generateAdaptiveIcon(1024, path.join(ASSETS, "adaptive-icon.png"));
generateSplashIcon(512,    path.join(ASSETS, "splash-icon.png"));
generateFavicon(64,        path.join(ASSETS, "favicon.png"));

console.log("\nDone! All icons saved to ./assets/\n");

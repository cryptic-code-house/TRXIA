import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function processLogos() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Read logo and wordmark files as base64
  const logoPath = 'C:\\Users\\Swaraj\\.gemini\\antigravity\\brain\\ef024ef6-d6e6-45c7-870b-d14d012a8138\\.user_uploaded\\media_1793911550250_58b1f75b.jpg';
  const wordmarkPath = 'C:\\Users\\Swaraj\\.gemini\\antigravity\\brain\\ef024ef6-d6e6-45c7-870b-d14d012a8138\\.user_uploaded\\media_1793911564176_3e920f8a.jpg';

  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const wordmarkBase64 = fs.readFileSync(wordmarkPath).toString('base64');

  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <canvas id="cLogo"></canvas>
        <canvas id="cWordmark"></canvas>
      </body>
    </html>
  `;

  await page.setContent(html);

  const processed = await page.evaluate(async (logoB64, wmB64) => {
    // 1. Process Logo
    const logoImg = new Image();
    await new Promise((res) => {
      logoImg.onload = res;
      logoImg.src = 'data:image/jpeg;base64,' + logoB64;
    });

    const cLogo = document.getElementById('cLogo');
    cLogo.width = logoImg.width;
    cLogo.height = logoImg.height;
    const ctxLogo = cLogo.getContext('2d');
    ctxLogo.drawImage(logoImg, 0, 0);

    const logoData = ctxLogo.getImageData(0, 0, logoImg.width, logoImg.height);
    const d = logoData.data;

    // White version
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      // Brightness calculation
      const brightness = (r + g + b) / 3;
      if (brightness > 220) {
        // Background white -> transparent
        d[i + 3] = 0;
      } else {
        // Logo pixels -> pure crisp white with preserved anti-aliasing
        const alpha = Math.max(0, Math.min(255, 255 - brightness));
        d[i] = 255;
        d[i + 1] = 255;
        d[i + 2] = 255;
        d[i + 3] = alpha > 40 ? 255 : alpha * 3;
      }
    }
    ctxLogo.putImageData(logoData, 0, 0);
    const whiteLogoPng = cLogo.toDataURL('image/png');

    // Orange version
    ctxLogo.drawImage(logoImg, 0, 0);
    const logoDataOrange = ctxLogo.getImageData(0, 0, logoImg.width, logoImg.height);
    const dO = logoDataOrange.data;
    for (let i = 0; i < dO.length; i += 4) {
      const r = dO[i];
      const g = dO[i + 1];
      const b = dO[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness > 220) {
        dO[i + 3] = 0;
      } else {
        const alpha = Math.max(0, Math.min(255, 255 - brightness));
        dO[i] = 255;      // Red
        dO[i + 1] = 110;  // Green
        dO[i + 2] = 24;   // Blue (#FF6E18)
        dO[i + 3] = alpha > 40 ? 255 : alpha * 3;
      }
    }
    ctxLogo.putImageData(logoDataOrange, 0, 0);
    const orangeLogoPng = cLogo.toDataURL('image/png');

    // 2. Process Wordmark
    const wmImg = new Image();
    await new Promise((res) => {
      wmImg.onload = res;
      wmImg.src = 'data:image/jpeg;base64,' + wmB64;
    });

    const cWm = document.getElementById('cWordmark');
    cWm.width = wmImg.width;
    cWm.height = wmImg.height;
    const ctxWm = cWm.getContext('2d');
    ctxWm.drawImage(wmImg, 0, 0);

    const wmData = ctxWm.getImageData(0, 0, wmImg.width, wmImg.height);
    const dW = wmData.data;
    for (let i = 0; i < dW.length; i += 4) {
      const r = dW[i];
      const g = dW[i + 1];
      const b = dW[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 35) {
        // Pure black -> transparent
        dW[i + 3] = 0;
      } else {
        // Bright white text
        dW[i] = 255;
        dW[i + 1] = 255;
        dW[i + 2] = 255;
        dW[i + 3] = Math.min(255, brightness * 1.5);
      }
    }
    ctxWm.putImageData(wmData, 0, 0);
    const wordmarkPng = cWm.toDataURL('image/png');

    return { whiteLogoPng, orangeLogoPng, wordmarkPng };
  }, logoBase64, wordmarkBase64);

  // Save to public/assets
  const whiteLogoBuffer = Buffer.from(processed.whiteLogoPng.split(',')[1], 'base64');
  fs.writeFileSync('public/assets/trxia-exact-logo-white.png', whiteLogoBuffer);

  const orangeLogoBuffer = Buffer.from(processed.orangeLogoPng.split(',')[1], 'base64');
  fs.writeFileSync('public/assets/trxia-exact-logo-orange.png', orangeLogoBuffer);

  const wordmarkBuffer = Buffer.from(processed.wordmarkPng.split(',')[1], 'base64');
  fs.writeFileSync('public/assets/trxia-exact-wordmark.png', wordmarkBuffer);

  await browser.close();
  console.log('Saved exact logos to public/assets!');
}

processLogos().catch(console.error);

import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSvg() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
  });
  const page = await browser.newPage();

  const originalB64 = fs.readFileSync('public/assets/trxia-tight-wordmark.png').toString('base64');

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="background: black; padding: 20px;">
        <img id="orig" src="data:image/png;base64,${originalB64}" style="height: 60px; display: block; margin-bottom: 20px;" />
        <svg id="svg" viewBox="0 0 178 28" style="height: 60px; fill: white; display: block;">
          <!-- T -->
          <path d="M 3 4 L 25 4 L 25 7.5 L 15.8 7.5 L 15.8 25.5 L 12.2 25.5 L 12.2 7.5 L 3 7.5 Z" />
          
          <!-- R -->
          <path d="M 44 4 L 57 4 C 62 4 65 6.8 65 11 C 65 14.5 62.5 17 58 17.5 L 65 25.5 L 60.5 25.5 L 54.2 18 L 47.6 18 L 47.6 25.5 L 44 25.5 Z M 47.6 7.2 L 47.6 14.8 L 56.5 14.8 C 59.5 14.8 61.2 13.5 61.2 11 C 61.2 8.5 59.5 7.2 56.5 7.2 Z" />

          <!-- X -->
          <path d="M 83 4 L 87.5 4 L 94 13.8 L 100.5 4 L 105 4 L 96.2 16.5 L 105 25.5 L 100.5 25.5 L 94 17.2 L 87.5 25.5 L 83 25.5 L 91.8 15 Z" />

          <!-- I -->
          <path d="M 126 4 L 129.5 4 L 129.5 25.5 L 126 25.5 Z" />

          <!-- A -->
          <path d="M 148 25.5 L 159.2 4 L 163 4 L 174 25.5 L 170.2 25.5 L 161.1 7.8 L 152 25.5 Z" />
        </svg>
      </body>
    </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: 'screenshots/vector_vs_raster_test.png' });
  await browser.close();
  console.log('Saved comparison screenshot to screenshots/vector_vs_raster_test.png');
}

testSvg().catch(console.error);

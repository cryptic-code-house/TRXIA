import puppeteer from 'puppeteer-core';
import path from 'path';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseDir = 'C:\\Users\\Swaraj\\.gemini\\antigravity\\brain\\ef024ef6-d6e6-45c7-870b-d14d012a8138\\screenshots';

  const viewports = [
    { name: 'desktop_hero', width: 1440, height: 900, selector: null },
    { name: 'desktop_sim', width: 1440, height: 900, selector: '#simulation' },
    { name: 'mobile_hero', width: 375, height: 812, selector: null },
    { name: 'mobile_sim', width: 375, height: 812, selector: '#simulation' },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    if (vp.selector) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView();
      }, vp.selector);
      await new Promise(r => setTimeout(r, 600));
    }

    const file = path.join(baseDir, `animated_${vp.name}.png`);
    await page.screenshot({ path: file });
    console.log('Saved:', file);
    await page.close();
  }

  await browser.close();
  console.log('Capture complete!');
}

capture();

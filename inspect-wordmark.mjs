import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspect() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
  });
  const page = await browser.newPage();

  const wmB64 = fs.readFileSync('public/assets/trxia-exact-wordmark.png').toString('base64');
  const logoB64 = fs.readFileSync('public/assets/trxia-exact-logo-white.png').toString('base64');

  const bounds = await page.evaluate(async (wmb, logob) => {
    function getBounds(b64) {
      return new Promise((res) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, img.width, img.height).data;

          let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              const alpha = data[(y * img.width + x) * 4 + 3];
              if (alpha > 20) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          res({
            totalWidth: img.width,
            totalHeight: img.height,
            minX, minY, maxX, maxY,
            cropWidth: maxX - minX + 1,
            cropHeight: maxY - minY + 1
          });
        };
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const wm = await getBounds(wmb);
    const logo = await getBounds(logob);
    return { wm, logo };
  }, wmB64, logoB64);

  console.log('Wordmark bounds:', bounds.wm);
  console.log('Logo bounds:', bounds.logo);
  await browser.close();
}

inspect().catch(console.error);

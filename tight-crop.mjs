import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function cropImages() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
  });
  const page = await browser.newPage();

  const wmB64 = fs.readFileSync('public/assets/trxia-exact-wordmark.png').toString('base64');
  const logoWhiteB64 = fs.readFileSync('public/assets/trxia-exact-logo-white.png').toString('base64');
  const logoOrangeB64 = fs.readFileSync('public/assets/trxia-exact-logo-orange.png').toString('base64');

  const cropped = await page.evaluate(async (wmb, lwb, lob) => {
    function cropToContent(b64, pad = 2) {
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

          minX = Math.max(0, minX - pad);
          minY = Math.max(0, minY - pad);
          maxX = Math.min(img.width - 1, maxX + pad);
          maxY = Math.min(img.height - 1, maxY + pad);

          const cropW = maxX - minX + 1;
          const cropH = maxY - minY + 1;

          const cOut = document.createElement('canvas');
          cOut.width = cropW;
          cOut.height = cropH;
          const ctxOut = cOut.getContext('2d');
          ctxOut.drawImage(img, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

          res(cOut.toDataURL('image/png'));
        };
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const wmCrop = await cropToContent(wmb, 3);
    const logoWhiteCrop = await cropToContent(lwb, 4);
    const logoOrangeCrop = await cropToContent(lob, 4);

    return { wmCrop, logoWhiteCrop, logoOrangeCrop };
  }, wmB64, logoWhiteB64, logoOrangeB64);

  // Write tightly cropped images
  fs.writeFileSync('public/assets/trxia-tight-wordmark.png', Buffer.from(cropped.wmCrop.split(',')[1], 'base64'));
  fs.writeFileSync('public/assets/trxia-tight-logo-white.png', Buffer.from(cropped.logoWhiteCrop.split(',')[1], 'base64'));
  fs.writeFileSync('public/assets/trxia-tight-logo-orange.png', Buffer.from(cropped.logoOrangeCrop.split(',')[1], 'base64'));

  await browser.close();
  console.log('Successfully saved tightly cropped high-res TRXIA assets!');
}

cropImages().catch(console.error);

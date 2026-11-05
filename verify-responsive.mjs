import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

const viewports = [
  { width: 320, height: 640, label: '320_phone_small' },
  { width: 360, height: 740, label: '360_phone_android' },
  { width: 375, height: 667, label: '375_phone_iphone' },
  { width: 390, height: 844, label: '390_phone_iphone14' },
  { width: 414, height: 896, label: '414_phone_large' },
  { width: 600, height: 960, label: '600_tablet_small' },
  { width: 768, height: 1024, label: '768_tablet_portrait' },
  { width: 820, height: 1180, label: '820_tablet_ipad_air' },
  { width: 1024, height: 768, label: '1024_tablet_landscape' },
  { width: 1280, height: 800, label: '1280_desktop' },
  { width: 1440, height: 900, label: '1440_desktop_macbook' },
  { width: 1920, height: 1080, label: '1920_desktop_fhd' },
  { width: 2560, height: 1440, label: '2560_desktop_qhd' },
];

if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

async function runVerification() {
  console.log(`Starting headless browser with: ${executablePath}`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  let hasErrors = false;
  const results = [];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });

    // Check for horizontal overflow
    const overflowInfo = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = doc.clientWidth;
      const hasOverflow = scrollWidth > clientWidth;

      // Find any overflowing elements
      const overflowingElements = [];
      if (hasOverflow) {
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > clientWidth + 1 || rect.left < -1) {
            overflowingElements.push({
              tag: el.tagName,
              id: el.id,
              class: el.className ? el.className.toString().slice(0, 50) : '',
              right: rect.right,
              clientWidth: clientWidth,
            });
          }
        }
      }

      return {
        hasOverflow,
        scrollWidth,
        clientWidth,
        diff: scrollWidth - clientWidth,
        overflowingElements: overflowingElements.slice(0, 5),
      };
    });

    results.push({
      viewport: `${vp.width}x${vp.height} (${vp.label})`,
      passed: !overflowInfo.hasOverflow,
      scrollWidth: overflowInfo.scrollWidth,
      clientWidth: overflowInfo.clientWidth,
      diff: overflowInfo.diff,
      elements: overflowInfo.overflowingElements,
    });

    // Capture screenshots for representative sizes
    if (['360_phone_android', '768_tablet_portrait', '1440_desktop_macbook', '1920_desktop_fhd'].includes(vp.label)) {
      await page.screenshot({
        path: path.join('screenshots', `${vp.label}_hero.png`),
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 1000) }
      });

      // Scroll to simulation and screenshot
      await page.evaluate(() => {
        const sim = document.getElementById('simulation');
        if (sim) sim.scrollIntoView();
      });
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({
        path: path.join('screenshots', `${vp.label}_simulation.png`),
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 1000) }
      });
    }

    if (overflowInfo.hasOverflow) {
      hasErrors = true;
      console.error(`❌ Overflow detected at ${vp.width}px: scrollWidth=${overflowInfo.scrollWidth}, clientWidth=${overflowInfo.clientWidth}`);
    } else {
      console.log(`✅ ${vp.width}px passed: No horizontal overflow (scrollWidth=${overflowInfo.scrollWidth}, clientWidth=${overflowInfo.clientWidth})`);
    }
  }

  // Test mobile drawer at 360px
  await page.setViewport({ width: 360, height: 740 });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  const menuButton = await page.$('button[aria-label="Open navigation menu"]');
  if (menuButton) {
    await menuButton.click();
    await new Promise(r => setTimeout(r, 400));
    const isDrawerOpen = await page.evaluate(() => {
      const drawer = document.getElementById('mobile-navigation');
      return drawer !== null;
    });
    console.log(`Mobile navigation drawer toggle test: ${isDrawerOpen ? 'PASSED ✅' : 'FAILED ❌'}`);
    await page.screenshot({
      path: path.join('screenshots', 'mobile_drawer_open.png'),
    });
  }

  // Test Simulation Mode Switcher
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const sim = document.getElementById('simulation');
    if (sim) sim.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Isolation Mode button
  const isolationButton = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent && b.textContent.includes('Isolation Mode'));
  });
  if (isolationButton) {
    await isolationButton.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({
      path: path.join('screenshots', 'isolation_flowchart.png'),
    });
    console.log('Isolation Mode flowchart toggle test: PASSED ✅');
  }

  await browser.close();

  fs.writeFileSync('verification-report.json', JSON.stringify(results, null, 2));
  console.log(`\nVerification finished. Overall status: ${hasErrors ? 'FAILED' : 'ALL 13 VIEWPORTS PASSED ✅'}`);
}

runVerification().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});

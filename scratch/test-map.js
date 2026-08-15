import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log('Navigating to http://localhost:3000/explore ...');
  await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle2' });
  
  console.log('Capturing map container dimensions...');
  const mapDims = await page.evaluate(() => {
    const el = document.querySelector('.absolute.inset-0') || document.querySelector('.w-full.h-full.min-h-\\[400px\\]');
    if (!el) return 'Container not found';
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  console.log('Map Dimensions:', mapDims);

  await browser.close();
})();

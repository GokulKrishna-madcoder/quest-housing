import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR (uncaught):', err.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  console.log('Navigating to test-map page...');
  await page.goto('http://localhost:3001/test-map', { waitUntil: 'networkidle2' });
  
  await browser.close();
})();

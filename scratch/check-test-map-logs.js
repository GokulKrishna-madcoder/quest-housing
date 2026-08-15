import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  console.log('Navigating to test-map page...');
  await page.goto('http://localhost:3001/test-map', { waitUntil: 'networkidle2' });
  
  await browser.close();
})();

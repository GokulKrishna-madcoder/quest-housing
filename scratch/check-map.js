import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle2' });
  
  const mapElementHtml = await page.evaluate(() => {
    const mapEl = document.querySelector('.absolute.inset-0, .min-h-\\[400px\\]');
    return mapEl ? mapEl.innerHTML : 'No container found';
  });
  
  console.log('Map HTML Preview (first 500 chars):', mapElementHtml.substring(0, 500));
  
  await browser.close();
})();

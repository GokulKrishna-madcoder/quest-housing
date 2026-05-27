import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle2' });
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  const hasControls = await page.evaluate(() => {
    return document.querySelector('button[title="Zoom in"]') !== null;
  });
  
  const hasWatermark = await page.evaluate(() => {
    return document.body.innerText.includes('For development purposes only');
  });
  
  console.log('Has Zoom Controls:', hasControls);
  console.log('Has Development Watermark:', hasWatermark);
  
  await browser.close();
})();

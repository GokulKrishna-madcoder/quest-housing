import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  console.log('Navigating to http://localhost:3000/explore ...');
  await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle2' });
  
  // Wait a few seconds for map tiles to load
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await page.screenshot({ path: 'scratch/screenshot-map.png', fullPage: true });
  console.log('Screenshot saved to scratch/screenshot-map.png');

  await browser.close();
})();

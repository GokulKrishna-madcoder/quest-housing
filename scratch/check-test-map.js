import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let mapTileRequests = 0;

  page.on('response', response => {
    const url = response.url();
    if (url.includes('maps.googleapis.com') || url.includes('mts.googleapis.com')) {
      if (response.ok() && (url.includes('ViewportInfoService') || url.includes('vt?pb='))) {
        mapTileRequests++;
      }
    }
  });
  
  console.log('Navigating to test-map page...');
  await page.goto('http://localhost:3001/test-map', { waitUntil: 'networkidle2' });
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('--- Network Analysis ---');
  console.log('Successful Map Tile Requests:', mapTileRequests);

  await browser.close();
})();

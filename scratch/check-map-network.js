import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let mapTileRequests = 0;
  let failedRequests = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('maps.googleapis.com') || url.includes('mts.googleapis.com')) {
      // console.log('Map Req:', url);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('maps.googleapis.com') || url.includes('mts.googleapis.com')) {
      if (!response.ok()) {
        failedRequests.push({ url, status: response.status() });
      } else {
        if (url.includes('ViewportInfoService') || url.includes('vt?pb=')) {
          mapTileRequests++;
        }
      }
    }
  });
  
  console.log('Navigating to explore page...');
  await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle2' });
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('--- Network Analysis ---');
  console.log('Successful Map Tile Requests:', mapTileRequests);
  if (failedRequests.length > 0) {
    console.log('FAILED Map API Requests:');
    failedRequests.forEach(r => console.log(`- Status ${r.status}: ${r.url}`));
  } else {
    console.log('No Failed Map Requests found.');
  }

  await browser.close();
})();

import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
  });
  await page.goto('http://localhost:5174/');
  await page.waitForSelector('.nav-item');
  const items = await page.$$('.nav-item');
  for (const item of items) {
    const text = await page.evaluate(el => el.innerText, item);
    if (text.includes('Matrix')) {
      await item.click();
      await new Promise(r => setTimeout(r, 1000));
      break;
    }
  }
  
  // Inject script to simulate drag
  await page.evaluate(() => {
    const source = document.querySelector('.card .col > div > div[draggable]');
    const targetZone = document.querySelectorAll('.col')[0]; // Schedule quad
    if (!source || !targetZone) { console.error("Could not find source or target"); return; }
    
    const dt = new DataTransfer();
    source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
    targetZone.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
    targetZone.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
    source.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
  });
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();

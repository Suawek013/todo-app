import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR LOG:', msg.text());
    }
  });
  await page.goto('http://localhost:5174/');
  await page.waitForSelector('.nav-item');
  const items = await page.$$('.nav-item');
  for (const item of items) {
    const text = await page.evaluate(el => el.innerText, item);
    if (text.includes('Focus')) {
      await item.click();
      await new Promise(r => setTimeout(r, 1000));
      break;
    }
  }
  await browser.close();
})();

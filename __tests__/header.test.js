const puppeteer = require('puppeteer');

jest.setTimeout(10000);

describe('Puppeteer Browser Tests', () => {
  let browser, page;

  beforeEach(async (done) => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('localhost:3000');
    done();
  });

  afterEach(async () => {
    await browser.close();
  });

  test('should find the correct text inside of the header', async (done) => {
    const text = await page.$eval('a.brand-logo', (el) => el.innerHTML);
    expect(text).toEqual('Blogster');
    done();
  });

  test('should start the oAuth flow after clicking the login button', async (done) => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
    done();
  });
});

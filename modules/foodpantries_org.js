const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

require('events').EventEmitter.defaultMaxListeners = 15;


async function getProviderData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector('.blog-list');
  const page_data = await page.evaluate(() => {
    const results = [];
    const items = document.querySelectorAll('.blog-list > h2 a');
    items.forEach(i => {
      results.push({link: i.getAttribute('href'), provider: i.innerText})
    });
    return results;
  });

  await browser.close();

  return page_data;
};

async function getAddress(provider) {
  const browser = await puppeteer.launch();
  let address = 'error';

  try {
    const pg = await browser.newPage();
    await pg.goto(provider.link);
    await pg.waitForSelector('.leaflet-popup-content');
    address = await pg.evaluate(() => {
      const a = document.querySelectorAll('.leaflet-popup-content')[0];
      return a.textContent;
    });
  } catch (err) {
    console.log(err);
    console.log('Error getting address for ' + JSON.stringify(provider));
  }

  await browser.close();

  return Object.assign({address: address}, provider);
};

async function decorateProviders(providers) {
  const promises = providers.map(async p => {
    const address = await getAddress(p);
    return address;
  });

  // const resolved = await Promise.all(promises);
  const resolved = await throttlePromises(promises);
  return resolved;
};

async function throttlePromises(promises) {
  const batchSize = 6;
  const resolved = [];

  while(promises.length > 0) {
    const to_resolve = promises.splice(0, batchSize);
    const lr = await Promise.all(to_resolve);
    resolved.push(lr);
  }

  return resolved.flat();
};

exports.scrape = async (url) => {
  const providers = await getProviderData(url);
  const decorated_providers = await decorateProviders(providers);

  return decorated_providers;
};

const axios = require('axios');
const cheerio = require('cheerio');

const MAIN_SELECTOR = 'h2 a';
const DETAIL_SELECTOR = '.container.content .row .span8 script';

async function getProviderData(url) {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const entries = $(MAIN_SELECTOR);
  const providers = [];

  entries.map(i => {
    const entry = entries[i].attribs;
    providers.push({provider: entry.title, link: entry.href});
  });

  return providers;
};

async function getDetails(provider) {
  const res = await axios.get(provider.link);
  const $ = cheerio.load(res.data);
  const entries = $(DETAIL_SELECTOR);

  let detailsJson = 'error';
  try {
    detailsJson = JSON.parse(entries[0].children[0].data.replace(/\n/g, '').replace("\\'", ''));
  } catch (err) {
    console.log('Error parsing JSON for\n', entries[0].children[0].data);
    console.log(err);
  }

  const fullAddress = detailsJson.address;
  const address = [fullAddress.streetAddress, fullAddress.addressLocality, fullAddress.addressRegion, fullAddress.postalCode].join(',');

  return Object.assign({address: address, phone: detailsJson.telephone, description: detailsJson.description}, provider);
};

async function decorateProviders(providers) {
  const promises = providers.map(async p => {
    const updatedProvider = await getDetails(p);
    return updatedProvider;
  });

  const resolved = await Promise.all(promises);
  return resolved;
};

exports.scrape = async (url) => {
  const providers = await getProviderData(url);
  const decorated_providers = await decorateProviders(providers);

  return decorated_providers;
};

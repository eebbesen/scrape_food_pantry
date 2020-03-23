const axios = require('axios');
const cheerio = require('cheerio');

async function getProviderData(url) {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const entries = $('h2 a');
  const providers = [];

  entries.map(i => {
    const entry = entries[i].attribs;
    providers.push({provider: entry.title, link: entry.href});
  });

  return providers;
};

async function getAddress(provider) {
  const res = await axios.get(provider.link);
  const $ = cheerio.load(res.data);
  const entries = $('.container.content .row .span8 script');

  let addressJson = 'error';
  try {
    addressJson = JSON.parse(entries[0].children[0].data.replace(/\n/g, '').replace("\\'", ''));
  } catch (err) {
    console.log('Error parsing JSON for\n', entries[0].children[0].data);
    console.log(err);
  }

  const fullAddress = addressJson.address;
  const address = [fullAddress.streetAddress, fullAddress.addressLocality, fullAddress.addressRegion, fullAddress.postalCode].join(',');

  return Object.assign({address: address, phone: addressJson.telephone, description: addressJson.description}, provider);
};

async function decorateProviders(providers) {
  const promises = providers.map(async p => {
    const address = await getAddress(p);
    return address;
  });

  const resolved = await Promise.all(promises);
  // const resolved = await throttlePromises(promises);
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

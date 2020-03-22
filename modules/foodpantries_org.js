const axios = require('axios');
const cheerio = require('cheerio');


async function getPage(url) {
  let res = await axios.get(url);
  return res.data
};

function parse(data) {
  const $ = cheerio.load(data);
  const entries = $('h2 a');
  const providers = [];

  entries.map(i => {
    console.log('CCCCCCCC', entries[i].attribs);
    const entry = entries[i].attribs;
    providers.push({provider: entry.title, link: entry.href});
  });

  return providers;
}

exports.scrape = async (url) => {
  const data = await getPage(url);
    return parse(data);
};

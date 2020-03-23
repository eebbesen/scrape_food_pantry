import foodpantries_org from './modules/foodpantries_org.js'

const res = foodpantries_org.scrape('https://www.foodpantries.org/ci/mn-st_paul');

res.then(r => {
  console.log('RESULTS\n', r);
});

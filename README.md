This is a utility for scraping food pantry (and other service locations) from compilation sites

# Install
```bash
npm install
```

# Run
```bash
npm run index.mjs <URL>
```

For example, the following will get foodpantries.org's entries for Saint Paul, MN:
```bash
npm run index.mjs https://www.foodpantries.org/ci/mn-st_paul
```

# Develop
This is currently setup only to scrape from https://www.foodpantries.org.

You can add other sources by creating utilities for them in modules, importing them into index.mjs and modifying index.mjs to use them instead of foodpantries_org.js

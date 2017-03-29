Language XML Scraper [![Build Status](https://travis-ci.org/OpenFn/language-xmlscraper.svg?branch=master)](https://travis-ci.org/OpenFn/language-xmlscraper)
======================

Language Pack for scraping XML data from websites.

Documentation
-------------

#### sample configuration
```json
{
  "username": "taylor@openfn.org",
  "password": "supersecret",
  "baseUrl": "https://instance_name.surveycto.com",
  "authType": "digest"
}
```

#### run a tito...
```js
tito(8485, "sillySalt");
```


[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

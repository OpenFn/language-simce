Language Simce [![Build Status](https://travis-ci.org/OpenFn/language-simce.svg?branch=master)](https://travis-ci.org/OpenFn/language-zurdo)
==============

Language Pack for extracting Chilean Schools Data.

**Node 7.6**

Documentation
-------------

#### sample configuration
```json
{
  "endpoint": "data/",
  "salt": "GedgafmgTicSimce2015",
  "mongoUrl": "mongodb://<USERNAME>:<PASSWORD>!@full-connection-string/<DATABASE>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"
}
```

#### fetch2015
```js
fetch2015({
  codes: [8873, 8874]
});
```

#### fetch2016
```js
fetch2016({
  codes: [
    1,
    2,
    3,
    4,
    5
  ]
});
```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

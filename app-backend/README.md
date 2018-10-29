## The APIs to the blockchain

### Dev Setup

#### Requirements

* Node.js v8
* Postgres 9.x (to support AWS Aurora)

#### Seeding the database

* To seed dev data locally, run `npm run seedData` This creates N organizations, N users within each org, and N events per user

If you are not seeding the database, but want to start with a clean database, add `{force: true}` to the `dbOptions` object in `db.js` before starting the server

#### Starting the API server

`npm run start`

### Test Setup

*  `npm install -g ganache-cli`
*  `npm install -g truffle`

* Create a postgres database named `re-test`
* Default connection params are in `/config/test.json` and `/config/default.json`

**The following additional steps must be performed on Windows Machines**
Locate the project's directory on your local machine. Blockchain -> app-backend -> truffle.js 
In the truffle.js file, make sure the ports in 'ganache', 'dev', and 'test' are all "8545" and host is "localhost"
Repeat in truffle-config.js
In the package.json file, change "truffle migrate" "truffle compile" to "truffle.cmd migrate" and "truffle.cmd compile"

### To run tests

```
npm run test
```

### To see documentation for API calls
* Start the API server `npm run start`
* Open documentaion page in your browser `open http://localhost:3000/api-docs`
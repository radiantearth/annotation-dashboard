const Models = require("./models");
const db = require("./db");

beforeEach(async () => {
  await db.drop();
  return Models.init();
});

afterAll(() => {
  db.close();
});
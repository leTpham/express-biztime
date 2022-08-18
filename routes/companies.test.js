const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
        INSERT INTO companies (code, name, description)
          VALUES ('tc', 'TestCompany', 'company for testing')
          RETURNING code, name`);
  testCompany = result.rows[0];
});

/** GET / - returns list of companies {companies: [{code, name}, ...]} */
describe("GET /companies", function () {
  test("Get a list of companies", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [testCompany],
    })
  })
});



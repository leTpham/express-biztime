const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
        INSERT INTO companies (code, name, description)
          VALUES ('tc', 'TestCompany', 'company for testing')
          RETURNING code, name, description`);
  testCompany = result.rows[0];
});

afterAll(async function () {
  await db.end();
});
// need this line so that jest closes after it runs its tests

/** GET / - returns list of companies {companies: [{code, name}, ...]} */
describe("GET /companies", function () {
  test("Get a list of companies", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [{code: testCompany.code, name: testCompany.name}],
    })
    expect(resp.statusCode).toEqual(200);
  })
});



/** GET /:code - returns obj of company:
 * {company: {code, name, description, invoices: [id, ...]}}
 * If the company cannot be found, returns a 404
*/
describe("GET /companies/:code", function () {
  test("Get a specific company", async function () {
    const resp = await request(app).get(`/companies/${testCompany.code}`);
    debugger;

    expect(resp.body).toEqual({company: {code: testCompany.code, name: testCompany.name,
                                        description: testCompany.description, invoices: []}});
    expect(resp.statusCode).toEqual(200);
  })
  test("Respond with 404 if not found", async function() {
    const resp = await request(app).get(`/companies/notfound`);

    expect(resp.statusCode).toEqual(404)
  })
})


/** POST  - adds a company
 * accepts JSON like {code, name, description}
 * returns obj of new company {company: {code, name, description}}
 */
describe("POST /companies", function () {
  test("Add a new company", async function () {
    const resp = await request(app).post(`/companies`)
                                    .send({code: "wow!", name: "wowzers", description: "this is amazing"});

    expect(resp.statusCode).toEqual(201);

    expect(resp.body).toEqual({company: {code: "wow!", name: "wowzers", description: "this is amazing"}});
  })
})


/** PUT /:code - edit existing company
 * accepts JSON like {name, description}
 * returns updated company object {company: {code, name, description}}
 * returns 404 if not found
*/
describe("PUT /companies/:code", function () {
  test("Update a company", async function () {
    const resp = await request(app).put(`/companies/${testCompany.code}`)
                                    .send({ name: "wowzers", description: "this is amazing" });
    expect(resp.statusCode).toEqual(200);

    expect(resp.body).toEqual({
          company: { code: testCompany.code, name: "wowzers", description: "this is amazing" }
    });
  });

  test("Respond with 404 if not found", async function () {
    const resp = await request(app).put(`/companies/notfound`)
                            .send({ name: "wowie", description: "this is ok" });
    expect(resp.statusCode).toEqual(404);
  });
});


/** DELETE /:code - deletes company
 * returns {status: "deleted"}
 * returns 404 if not found
 */
describe("DELETE /companies/:code", function () {
  test("Delete a company", async function () {
    const resp = await request(app)
        .delete(`/companies/${testCompany.code}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ status: "deleted" });
    
  });
});



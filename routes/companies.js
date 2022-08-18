"use strict";
/** Routes about companies */
const express = require("express");

//import errors to use
const { NotFoundError } = require("../expressError");

const router = express.Router();
const db = require("../db");


/** GET / - returns list of companies {companies: [{code, name}, ...]} */
router.get("/", async function (req, res) {
  const result = await db.query(`SELECT code, name FROM companies`);
  const companies = result.rows;

  return res.json({ companies });
});



// /** GET /:code - returns object of company {company: {code, name, description}}
//  * return 404 if not found.
//  */
// router.get("/:code", async function (req, res) {
//   const code = req.params.code;
//   const result = await db.query(`SELECT code, name, description
//                                   FROM companies where code = $1`, [code]);
//   const company = result.rows[0];

//   if (!company) throw new NotFoundError(`No matching company: ${code}`);
//   return res.json({ company })
// })


/** POST  - adds a company
 * accepts JSON like {code, name, description}
 * returns obj of new company {company: {code, name, description}}
 */
router.post("/", async function (req, res) {
  const { code, name, description } = req.body;
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
                    VALUES($1, $2, $3)
                    RETURNING code, name, description`,
    [code, name, description]);
  const company = results.rows[0];

  return res.status(201).json({ company });
});


/** PUT /:code - edit existing company
 * accepts JSON like {name, description}
 * returns updated company object {company: {code, name, description}}
 * returns 404 if not found
*/
router.put("/:code", async function (req, res) {
  const code = req.params.code;
  const { name, description } = req.body;

  const results = await db.query(
    `UPDATE companies
                      SET name = $1, description = $2
                      WHERE code = $3
                      RETURNING code, name, description`,
    [name, description, code]
  );

  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
});


/** DELETE /:code - deletes company
 * returns {status: "deleted"}
 * returns 404 if not found
 */
router.delete("/:code", async function (req, res) {
  const code = req.params.code;

  const results = await db.query(
    `DELETE FROM companies WHERE code = $1 RETURNING code`, [code]);
  const companyCode = results.rows[0];

  if (!companyCode) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ status: "deleted" });
});


/** GET /:code - returns obj of company:
 * {company: {code, name, description, invoices: [id, ...]}}
 * If the invoice cannot be found, returns a 404
*/

router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const cResult = await db.query(
    `SELECT code, name, description
                  FROM companies
                  WHERE code = $1`, [code]
  );
  const company = cResult.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  const iResults = await db.query(
    `SELECT id, comp_code, amt, paid, add_date, paid_date
                  FROM invoices
                  WHERE comp_code = $1`, [code]
  );
  const invoices = iResults.rows;
  company.invoices = invoices;

  return res.json({ company });

});


module.exports = router;
"use strict";
/** Routes about companies */
const express = require("express");

//import errors to use
const {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
        } = require("../expressError");

const router = express.Router();
const db = require("../db");


/** GET / - returns list of companies {companies: [{code, name}, ...]} */
router.get("/", async function(req, res) {
  const result = await db.query(`SELECT code, name FROM companies`);
  const companies = result.rows;

  return res.json({companies})
} )



/** GET /:code - returns object of company {company: {code, name, description}}
 * return 404 if not found.
 */
router.get("/:code", async function(req, res) {
  const code = req.params.code;
  const result = await db.query(`SELECT code, name, description
                                  FROM companies where code = $1`, [code]);
  const company = result.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({company})
})






/** POST  - adds a company
 * accepts JSON like {code, name, description}
 * returns obj of new company {company: {code, name, description}}
 */







/** PUT /:code - edit existing company
 * accepts JSON like {name, description}
 * returns updated company object {company: {code, name, description}}
 * returns 404 if not found
*/





/** DELETE /:code - deletes company
 * returns {status: "deleted"}
 * returns 404 if not found
 */


module.exports = router;



"use strict";
/** Routes about companies */
const express = require("express");

//import errors to use
const { NotFoundError } = require("../expressError");

const router = express.Router();
const db = require("../db");

// id | comp_code |  amt   | paid |  add_date  | paid_date

/** GET / - return info on invoices: {invoices: [{id, comp_code}, ...]} */
router.get("/", async function (req, res) {
    const result = await db.query(`SELECT id, comp_code FROM invoices`);
    const invoices = result.rows;
  
    return res.json({ invoices })
  })

/** GET /:id - returns obj on given invoice:
 *  {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 * returns 404 if not found
 */
 router.get("/:id", async function (req, res) {
    const id = req.params.id;
    const iResult = await db.query(`SELECT id, amt, paid, add_date, paid_date
                                    FROM invoices where id = $1`, [id]);
    const invoice = iResult.rows[0];
    
    const cResult = await db.query(
                `SELECT code, name, description FROM companies
                WHERE (SELECT comp_code FROM invoices WHERE id = $1) = code`, [id]);

    const company = cResult.rows[0];
    invoice.company = company;
  
    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
    return res.json({ invoice });
  })


/** POST / - Adds an invoice
 * accepts JSON like: {comp_code, amt}
 * returns obj of new invoice: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

 router.post("/", async function (req, res) {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt)
                      VALUES($1, $2)
                      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]);
    const invoice = results.rows[0];
  
    return res.status(201).json({ invoice });
  })


/** PUT /:id - Updates an invoice
 * Accepts JSON of {amt}
 * If invoice cannot be found, returns a 404
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */



/** DELETE /:id - Deletes an invoice
 * If invoice cannot be found, returns a 404
 * Returns: {status: "deleted"}
 */


/** GET /:code - returns obj of company: 
 * {company: {code, name, description, invoices: [id, ...]}}
 * If the invoice cannot be found, returns a 404
*/


module.exports = router;
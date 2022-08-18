/** Database setup for BizTime. */

const { Client } = require("pg");

const DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql://localhost/biztime_test"
    : "postgresql://localhost/biztime";

// const DB_URI = process.env.NODE_ENV === "test"
//     ? "postgresql://alexjooho:jooho@localhost/biztime_test" // this is for windows :(
//     : "postgresql://alexjooho:jooho@localhost/biztime";

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;
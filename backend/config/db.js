const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed");
    console.log(err);
  } else {
    console.log("MySQL Connected Successfully");
  }
});

// Support both callback-style and async/await Promise-style execution
const originalExecute = db.execute.bind(db);
db.execute = function(...args) {
  const lastArg = args[args.length - 1];
  if (typeof lastArg === "function") {
    return originalExecute(...args);
  }
  return db.promise().execute(...args);
};

const originalQuery = db.query.bind(db);
db.query = function(...args) {
  const lastArg = args[args.length - 1];
  if (typeof lastArg === "function") {
    return originalQuery(...args);
  }
  return db.promise().query(...args);
};

module.exports = db;
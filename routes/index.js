// Importing express into our file
const express = require("express");
const router = express.Router();

// Setting up a route (it takes request and response as two parameters with the route path behind them)
router.get("/", (req, res) => {
  // Rendering our view
  res.render("index");
});

// exporting our index file to server file
module.exports = router;

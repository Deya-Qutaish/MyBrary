// Importing express into our file
const express = require("express");
const router = express.Router();
const Book = require("../models/book");

// Setting up a route (it takes request and response as two parameters with the route path behind them)
router.get("/", async (req, res) => {
  // Rendering our view
  let book;
  try {
    books = await Book.find().sort({ createAt: "desc" }).limit(10).exec();
  } catch {
    books = [];
  }
  res.render("index", { books: books });
});

// exporting our index file to server file
module.exports = router;

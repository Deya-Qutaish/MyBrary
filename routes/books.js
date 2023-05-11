const express = require("express");
const router = express.Router();
// we dont need multer since filepond encodes the file
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// Importing Book Schema so we can access the database
const Book = require("../models/book");
const Author = require("../models/author");
const { error, log } = require("console");
// const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg,", "image/png", "image/gif"];
// const upload = multer({
//   dest: uploadPath,
//   fileFilter: (req, file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype));
//   },
// });

// All books route
router.get("/", async (req, res) => {
  // implementing search with query and regular expression (regex)
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    // lte = less than first parameter is what we want to check and the second is what we compare it with so published date is less than published before
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    // gte = greater than
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    // awaiting the query above to execute
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// New books route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//   create books route
router.post(
  "/",
  /* upload.single("cover"),*/ async (req, res) => {
    // const fileName = req.file != null ? req.file.filename : null;

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      // coverImageName: fileName,
      description: req.body.description,
    });
    saveCover(book, req.body.cover);

    try {
      const newBook = await book.save();
      res.redirect(`books/${newBook.id}`);
    } catch {
      // if (book.coverImageName != null) {
      //   removeBookCover(book.coverImageName);
      // }
      renderNewPage(res, book, true);
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book: book });
  } catch {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});

// function removeBookCover(fileName) {
//   fs.unlink(path.join(uploadPath, fileName), (err) => {
//     if (err) console.error(err);
//   });
// }

//   update books route
router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    if (book != null) {
      renderNewPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});

router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.deleteOne();
    res.redirect("/books");
  } catch {
    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "Could not remove book",
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}
async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating Book";
      } else {
        params.errorMessage = "Error Creating Book";
      }
    }
    res.render(`books/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;

const mongoose = require("mongoose");

const path = require("path");
const coverImageBasePath = "uploads/bookCovers";

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  publishDate: {
    type: Date,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    // We set the default value so we we do not manually add the date each time we create book
    default: Date.now,
  },
  coverImageName: {
    type: String,
    required: true,
  },
  author: {
    // we use this type to tell mongoose we are referencing another object within our database/collection
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // we set a reference for another model which needs to exactly match the desired model
    ref: "Author",
  },
});

bookSchema.virtual("coverImagePath").get(function () {
  if (this.coverImageName != null) {
    return path.join("/", coverImageBasePath, this.coverImageName);
  }
});

module.exports = mongoose.model("Book", bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;

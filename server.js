if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Using express and express layouts
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");

// requiring the index route file so our server knows it exists to use it
const indexRouter = require("./routes/index");

// Setting up view engine and layouts and views for our page rendering
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));

// importing mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

// telling our app to handle the indexRouter
app.use("/", indexRouter);

// Listening in on ports from our server
app.listen(process.env.PORT || 3000);

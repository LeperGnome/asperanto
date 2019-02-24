const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const accountsRouter = require("./routes/api/accounts");
const organizationsRouter = require("./routes/api/organizations");
const productsRouter = require('./routes/api/products');
const serviceRouter = require('./routes/api/services');

const app = express();

//CORS Configuration
const cors = require('cors');
// app.use(cors());

const corsOptions = {
  origin: ['http://localhost:8000', 'http://localhost:8080', 'http://asperanto.com', 'http://asperanto.ru'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB config
const db = require("./config/keys").mongoURI;

// Connect to mongodb
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB connected."))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// routes 
app.use("/api/accounts", cors(corsOptions), accountsRouter);
app.use("/api/organizations", cors(corsOptions), organizationsRouter);
app.use("/api/products", cors(corsOptions), productsRouter);
app.use("/api/services", cors(corsOptions), serviceRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

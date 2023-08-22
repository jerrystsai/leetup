// Imports, external
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { ValidationError } = require('sequelize');

// Imports, internal
const { environment } = require('./config');
const isProduction = environment === 'production';

// Initialize app
const app = express();

// Use all global middleware
app.use(morgan('dev'));   // for logging
app.use(cookieParser());  // for parsing cookies
app.use(express.json());  // converts JSON req bodies into parsed objects attached to req.body

// Security Middleware
if (!isProduction) {
  app.use(cors())
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);

// Routes
const routes = require('./routes');
app.use(routes); // Connect all the routes

// Error-handling middleware

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
    err.stack: isProduction ? null : err.stack
  }
  next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    // title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});

// Exports
module.exports = app;

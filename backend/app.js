// Imports, external
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

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


// Error-handling middleware

// Exports

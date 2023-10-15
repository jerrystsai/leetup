// External
const express = require('express');
const bcrypt = require('bcryptjs');
const { validationResult, check } = require('express-validator');

// Internal
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');

const { User } = require('../../db/models');

// Middleware for user-already-created errors as express-validator middleware
const handleCredentialErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach(error => errors[error.path] = error.msg);

    const err = Error("User already exists");
    err.errors = errors;
    err.status = 500;
    err.title = "User already exists";
    next(err);
  }
  next();
}

const validateCredentials = [
  check('email')
    .custom(async (value) => {
      const selectedUserEmail = await User.findOne({
        where: {email: value}
      });
      if (selectedUserEmail) throw new Error('Blah blah');
      // ^ seems like throwing the error is what works, not the message itself
      return !!selectedUserEmail;
    })
    .withMessage('User with that email already exists'),
  check('username')
    .custom(async (value) => {
      const selectedUserUsername = await User.findOne({
        where: {username: value}
      });
      if (selectedUserUsername) throw new Error('Blah blah');
      // ^ seems like throwing the error is what works, not the message itself
      return !!selectedUserUsername;
    })
    .withMessage('User with that username already exists'),
  handleCredentialErrors
];

const validateSignup = [
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('You must provide a first name.')
    .custom((value) => {return !(/^\s/.test(value));})
    .withMessage('First names cannot start with a space.')
    .isLength({ min: 1 })
    .withMessage('Please provide a first name with at least 1 character.'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('You must provide a last name.')
    .custom((value) => {return !(/^\s/.test(value));})
    .withMessage('Last names cannot start with a space.')
    .isLength({ min: 1 })
    .withMessage('Please provide a last name with at least 1 character.'),
  check('email')
    .custom((value) => {return !(/\s/.test(value));})
    .withMessage('Emails must not contain any spaces.')
    .isEmail()
    .withMessage('Please provide a valid email address. (Email addresses may not contain any spaces.)')
    .exists({ checkFalsy: true })
    .withMessage('You must provide a valid email address.'),
  check('username')
    .custom((value) => {return !(/\s/.test(value));})
    .withMessage('Usernames must not contain any spaces.')
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.')
    .exists({ checkFalsy: true })
    .withMessage('You must provide a valid username.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    // .custom((value) => {return !(/\s/.test(value));})
    // .withMessage('Passwords must not contain any spaces.')
    .custom((value) => {return !(/^\s/.test(value));})
    .withMessage('Passwords must not begin with or end with a space.')
    .custom((value) => {return !(/\s$/.test(value));})
    .withMessage('Passwords must not begin with or end with a space.')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];



const router = express.Router();


// Sign up a User
router.post('/', validateSignup, validateCredentials, async (req, res) => {
  const { firstName, lastName, email, password, username } = req.body;
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({ firstName, lastName, email, username, hashedPassword });

  const safeUser = user.toSafe();

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser
  });
});

module.exports = router;

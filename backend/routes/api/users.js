// External
const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');

// Internal
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');

const { User } = require('../../db/models');

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
    .withMessage('Please provide a valid email. (If valid email, emails may not contain any spaces.)')
    .custom(async (value) => {
      console.log('------', value);
      const selectedUserEmail = await User.findOne({
        where: {email: value}
      });
      if (selectedUserEmail) throw new Error('Blah blah');
      // ^ seems like throwing the error is what works, not the message itself
      return !!selectedUserEmail;
    })
    .withMessage('User with that email already exists')
    .exists({ checkFalsy: true })
    .withMessage('You must provide a valid email.'),
  check('username')
    .custom((value) => {return !(/\s/.test(value));})
    .withMessage('Usernames must not contain any spaces.')
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.')
    .custom(async (value) => {
      const selectedUserUsername = await User.findOne({
        where: {username: value}
      });
      if (selectedUserUsername) throw new Error('Blah blah');
      // ^ seems like throwing the error is what works, not the message itself
      return !!selectedUserUsername;
    })
    .withMessage('User with that username already exists')
    .exists({ checkFalsy: true })
    .withMessage('You must provide a valid username.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .custom((value) => {return !(/\s/.test(value));})
    .withMessage('Passwords must not contain any spaces.')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

const router = express.Router();


// Get the Current User
router.get('/me', requireAuth, async (req, res) => {

  const { user } = req;
  // console.log(user);
  if (user) {
    const safeUser = user.toSafe();
    return res.json({
      user: safeUser
    });
  } else return res.json({ user: null });

});


// Sign up
router.post('/', validateSignup, async (req, res) => {
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

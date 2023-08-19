// External
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');

// Internal
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');

const { User } = require('../../db/models');

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required'),
  handleValidationErrors
];

const router = express.Router();

// Routes

// Restore session user
router.get('/', (req, res) => {
  const { user } = req;
  if (user) {
    const safeUser = user.toSafe();
    return res.json({
      user: safeUser
    });
  } else return res.json({ user: null });
});

router.post('/', validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  const user = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential
      }
    }
  });

  if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
    res.status(401).json({
      message: "Invalid credentials"
    })
    // const err = new Error('Login failed');
    // err.status = 401;
    // err.title = 'Login failed';
    // err.errors = { credential: 'The provided credentials were invalid.' };
    return next(err);
  }

  const safeUser = user.toSafe();

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser
  });
});

router.delete('/', (_req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'success' });
});

module.exports = router;

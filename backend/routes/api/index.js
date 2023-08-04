const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');

const { User } = require('../../db/models');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');



// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session isnot valid, set req.user to null
router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);


// Add a XSRF-TOKEN cookie
router.get("/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    'XSRF-Token': csrfToken
  });
});

//
// Test auth middlewares
//

// Test set token cookie
// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//     where: {
//       username: 'Demo-lition'
//     }
//   });
//   setTokenCookie(res, user);
//   return res.json({ user: user });
// });

// Test restore user
// router.get('/restore-user', (req, res) => {
//   return res.json(req.user);
// });

// Test require auth
// router.get('/require-auth', requireAuth, (req, res) => {
//   return res.json(req.user);
// });


// Test router
router.post('/test', function(req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;

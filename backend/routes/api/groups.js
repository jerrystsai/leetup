// External
const express = require('express');
const { check } = require('express-validator');

// Internal
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');

const { User } = require('../../db/models');
const { Group } = require('../../db/models');

const router = express.Router();

// Get the Current User
router.get('/', async (req, res) => {

  const allGroups = await Group.findAll();
  return res.json(allGroups);
});



module.exports = router;

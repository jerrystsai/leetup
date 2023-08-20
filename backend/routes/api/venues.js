// External
const express = require('express');
const { check } = require('express-validator');
const { Op } = require("sequelize");

// Internal
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { graftValues, findAllResultToArray } = require('../../utils/functions');
const {
  handleValidationErrors,
  validateGroup,
  validateVenue,
  validateImage,
  validateGroupId
} = require('../../utils/validation');

const { User, Group, Image, Venue, GroupMember } = require('../../db/models');
const { sequelize } = require('../../db/models');

const router = express.Router();

//
// ROUTE HANDLING
//

// Edit a Venue specified by its id
router.put('/:venueId', requireAuth, validateVenue, async (req, res) => {
  const { venueId } = req.params;
  const userId = +req.user.id;
  const { address, city, state, lat, lng } = req.body;

  const specificVenue = await Venue.findByPk(venueId);

  if (!specificVenue) {
    res.status(404).json({
      message: "Venue couldn't be found"
    });
  } else {
    const groupIdOfSpecificVenue = specificVenue.groupId;
    const selectedGroup = await Group.findByPk(groupIdOfSpecificVenue, {attributes: ['organizerId']});
    const groupCohosts = await GroupMember.findAll({
      attributes: ['userId'],
      where: {
        groupId: groupIdOfSpecificVenue,
        status: 'co-host'
      },
      raw: true
    });
    const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

    if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
      res.status(403).json({
        message: "Forbidden"
      });
    } else {
      const updatedVenue = await specificVenue.update(
        { groupId: groupIdOfSpecificVenue, address, city, state, lat, lng }
      );
      const updatedVenueConfirmed = await Venue.findByPk(venueId, {
      });

      res.status(200).json(updatedVenueConfirmed);
    }
  }
});

module.exports = router;

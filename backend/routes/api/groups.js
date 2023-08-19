// External
const express = require('express');
// const { check } = require('express-validator');
const { Op } = require("sequelize");

// Internal
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const {
  handleValidationErrors,
  validateGroup,
  validateVenue,
  validateEvent,
  validateImage,
  validateGroupId
} = require('../../utils/validation');

const { User, Group, Image, Venue, GroupMember, Event } = require('../../db/models');
const { sequelize } = require('../../db/models');

const router = express.Router();

//
// ROUTE HANDLING
//

// Get details of a Group from an id
router.get('/:groupId/members', validateGroupId, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;

  const selectedGroup = await Group.findByPk(groupId, {attributes: ['organizerId']});
  const groupCohosts = await GroupMember.findAll({
    attributes: ['userId'],
    where: {
      groupId,
      status: 'co-host'
    },
    raw: true
  });
  const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

  if (!selectedGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
    const membersOfSpecificGroup = await Group.findByPk(groupId, {
      attributes: [],
      include: [
        {
          model: User,
          as: 'Members',
          attributes: ['id', 'firstName', 'lastName'],
          through: {
            attributes: ['status'],
            as: 'Membership',
            where: { [Op.not]: {status: 'pending'} }
          },
        }
      ]
    });

    return membersOfSpecificGroup ? res.json(membersOfSpecificGroup): res.status(404).json({message: "Group couldn't be found"});
  } else {
    const membersOfSpecificGroup = await Group.findByPk(groupId, {
      attributes: [],
      include: [
        {
          model: User,
          as: 'Members',
          attributes: ['id', 'firstName', 'lastName'],
          through: {
            attributes: ['status'],
            as: 'Membership'
          }
        }
      ]
    });

    return membersOfSpecificGroup ? res.json(membersOfSpecificGroup): res.status(404).json({message: "Group couldn't be found"});
  }
});

// Get All Venues for a Group specified by its id
router.get('/:groupId/venues', requireAuth, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;

  const selectedGroup = await Group.findByPk(groupId, {attributes: ['organizerId']});
  const groupCohosts = await GroupMember.findAll({
    attributes: ['userId'],
    where: {
      groupId,
      status: 'co-host'
    },
    raw: true
  });
  const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

  if (!selectedGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
    res.status(403).json({
      message: "Forbidden"
    });
  } else {
    const venuesOfSpecificGroup = await Group.findByPk(groupId, {
      attributes: [],
      include: [
        {
          model: Venue,
          // attributes: ['id', 'firstName', 'lastName'],
        }
      ]
    });

    return venuesOfSpecificGroup ? res.json(venuesOfSpecificGroup): res.status(404).json({message: "Group couldn't be found"});
  }
});

// Get all Events of a Group specified by its id
router.get('/:groupId/events', validateGroupId, async (req, res) => {
  const { groupId } = req.params;

  const selectedGroup = await Group.findByPk(groupId, {attributes: ['organizerId']});

  if (!selectedGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    })
  } else {
    const allEvents = await Event.findAll({
    include: [
        {
          model: User,
          attributes: [],
        },
        {
          model: Image,
          attributes: [],
          where: { preview: true },
          required: false,
          as: 'EventImages'
        },
        {
          model: Group,
          attributes: ['id', 'name', 'city', 'state'],
          // as: 'Members'
        },
        {
          model: Venue,
          attributes: ['id', 'city', 'state'],
          // as: 'Members'
        }
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('`Users->EventAttendee`.`id`')), 'numAttending'],
          [sequelize.col('EventImages.url'), 'previewImage']
        ],
        exclude: ['description', 'capacity', 'price']
      },
      group: ['Event.id'],
      where: { groupId }
    });

    return res.json({Events: allEvents});
  }
});


// Create a new Venue for a Group specified by its id
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;
  const { address, city, state, lat, lng } = req.body;

  const selectedGroup = await Group.findByPk(groupId, {attributes: ['organizerId']});
  const groupCohosts = await GroupMember.findAll({
    attributes: ['userId'],
    where: {
      groupId,
      status: 'co-host'
    },
    raw: true
  });
  const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

  if (!selectedGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
    res.status(403).json({
      message: "Forbidden"
    });
  } else {
    const newVenue = await Venue.create({ groupId, address, city, state, lat, lng  });
    const newVenueConfirmed = await Venue.findByPk(newVenue.id, {
    });

    res.status(200).json(newVenueConfirmed);
  }
});

// Create an Event for a Group specified by its id
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;
  const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

  const selectedGroup = await Group.findByPk(groupId, {attributes: ['organizerId']});
  const groupCohosts = await GroupMember.findAll({
    attributes: ['userId'],
    where: {
      groupId,
      status: 'co-host'
    },
    raw: true
  });
  const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

  if (!selectedGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
    res.status(403).json({
      message: "Forbidden"
    });
  } else {
    const newEvent = await Event.create({ groupId, venueId, name, type, capacity, price, description, startDate, endDate });
    const newEventConfirmed = await Event.findByPk(newEvent.id, {
    });

    res.status(200).json(newEventConfirmed);
  }
});

// Add an Image to a Group based on the Group's id
router.post('/:groupId/images', requireAuth, validateImage, async (req, res) => {
  const { groupId } = req.params;
  const { url, preview } = req.body;
  const userId = +req.user.id;

  const specificGroup = await Group.findByPk(groupId, {
    attributes: ['organizerId']
  });

  if (!specificGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else if (userId !== specificGroup.organizerId) {
    res.status(403).json({
      message: "Forbidden"
    });
  } else {
    const newImage = await Image.create(
      {
        url,
        preview,
        imageableId: groupId,
        imageableType: 'Group'
      }
    );

    const image = await Image.findByPk(newImage.id);

    res.status(200).json(image);
  }
});

// Get all Groups joined or organized by the Current User
router.get('/me', requireAuth, async (req, res) => {
  const allGroupsForUser = await Group.findAll({
    include: [
      {
        model: User,
        attributes: [],
        as: 'Members'
      },
      {
        model: Image,
        attributes: [],
        where: { preview: true },
        required: false,
        as: 'GroupImages'
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('`Members->GroupMember`.`id`')), 'numMembers'],
        [sequelize.col('GroupImages.url'), 'previewUrl']
      ]
    },
    group: ['Group.id'],
    where: {
      [Op.or]: [
        { organizerId: Number(req.user.id) },
        { '$`Members->GroupMember`.`userId`$': Number(req.user.id) }
      ]
    }
  });

  return res.json({Groups: allGroupsForUser});
});

// Get details of a Group from an id
router.get('/:groupId', async (req, res) => {
  const { groupId } = req.params;

  const specificGroup = await Group.findByPk(groupId, {
    include: [
      {
        model: Image,
        // attributes: [],
        where: { preview: true },
        required: false,
        as: 'GroupImages'
      },
      {
        model: User,
        // attributes: [],
        as: 'Organizers'
      },
      {
        model: User,
        attributes: [],
        as: 'Members'
      },
      {
        model: Venue,
        // attributes: []
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('`Members->GroupMember`.`id`')), 'numMembers'],
      ]
    },
    group: ['Group.id']
  });

  return specificGroup ? res.json(specificGroup): res.status(404).json({message: "Group couldn't be found"});
});

// Edit a Group
router.put('/:groupId', requireAuth, validateGroup, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;

  const specificGroup = await Group.findByPk(groupId);

  if (!specificGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else if (userId !== specificGroup.organizerId) {
    res.status(403).json({
      message: "Forbidden"
    });
  } else {
    const { name, about, type, private, city, state } = req.body;
    const updatedGroup = await specificGroup.update(
      { organizerId: userId, name, about, type, private, city, state }
    );
    res.status(200).json(updatedGroup);
  }
});

// Delete a group
router.delete('/:groupId', requireAuth, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;

  const specificGroup = await Group.findByPk(groupId);

  if (!specificGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else if (userId !== specificGroup.organizerId) {
    res.status(403).json({
      message: "Forbidden"
    });
  } else {
    const specificGroup = await Group.findByPk(groupId, {
    });

    await specificGroup.destroy();

    res.status(200).json({message: "Successfully deleted"});
  }
});

// Get all Groups
router.get('/', async (req, res) => {
  const allGroups = await Group.findAll({
    include: [
      {
        model: User,
        attributes: [],
        as: 'Members'
      },
      {
        model: Image,
        attributes: [],
        where: { preview: true },
        required: false,
        as: 'GroupImages'
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('`Members->GroupMember`.`id`')), 'numMembers'],
        [sequelize.col('GroupImages.url'), 'previewUrl']
      ]
    },
    group: ['Group.id']
  });

  return res.json({Groups: allGroups});
});

// Create a Group
router.post('/', requireAuth, validateGroup, async (req, res) => {
  const { name, about, type, private, city, state } = req.body;
  const organizerId = +req.user.id;
  const group = await Group.create({ organizerId, name, about, type, private, city, state });

  res.status(201).json(group);
});

module.exports = router;

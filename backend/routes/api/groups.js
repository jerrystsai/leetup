// External
const express = require('express');
const { check } = require('express-validator');
const { Op } = require("sequelize");

// Internal
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');

const { User, Group, Image, Venue, GroupMember } = require('../../db/models');
const { sequelize } = require('../../db/models');

const validateGroup = [
  check('name')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 1, max: 60})
    .withMessage('Name must be 60 characters or less'),
  check('about')
    .isString()
    .withMessage('About must be a string')
    .isLength({ min: 50 })
    .withMessage('About must be 50 characters or more.'),
  check('type')
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
  check('private')
    .isBoolean()
    .withMessage('Private must be a boolean'),
  check('city')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  check('state')
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be exactly 2 uppercase characters')
    .isUppercase()
    .withMessage('State must be exactly 2 uppercase characters'),
  handleValidationErrors
];

const validateImage = [
  check('url')
    .exists({ checkFalsy: true })
    .isString()
    .isURL()
    .isLength({ max: 255})
    .withMessage('Url must be a url'),
  check('preview')
    .isBoolean()
    .withMessage('Private must be a boolean'),
  handleValidationErrors
];

const validateGroupId = [
  check('groupId')
    .exists({ checkFalsy: true })
    .isInt({min: 1, allow_leading_zeroes: false})
    .withMessage("Invalid group number"),
  handleValidationErrors
];

const router = express.Router();

//
// ROUTE HANDLING
//

// Get details of a Group from an id
router.get('/:groupId/members', async (req, res) => {
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

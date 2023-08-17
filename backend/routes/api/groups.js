// External
const express = require('express');
const { check } = require('express-validator');
const { Op } = require("sequelize");

// Internal
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');

const { User, Group, Image, Venue } = require('../../db/models');
const { sequelize } = require('../../db/models');

const router = express.Router();


// Get all Groups joined or organized by the Current User
router.get('/me', requireAuth, async (req, res) => {
  const allGroupsForUser = await Group.findAll({
    include: [
      {
        model: User,
        attributes: [],
        as: 'Member'
      },
      {
        model: Image,
        attributes: [],
        where: { preview: true },
        required: false
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('`Member->GroupMember`.`id`')), 'numMembers'],
        [sequelize.col('Images.url'), 'previewUrl']
      ]
    },
    group: ['Group.id'],
    where: {
      [Op.or]: [
        { organizerId: req.user.id },
        { '$`Member->GroupMember`.`id`$': req.user.id }
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
        attributes: [],
        where: { preview: true },
        required: false
      },
      {
        model: User,
        attributes: [],
        as: 'Member'
      },
      {
        model: Venue,
        // attributes: []
      }
    ],
    // attributes: {
    //   include: [
    //     [sequelize.fn('COUNT', sequelize.col('Users.id')), 'numMembers'],
    //     [sequelize.col('Images.url'), 'previewUrl']
    //   ]
    // },
    group: ['Group.id']
  });

  return res.json({Groups: specificGroup});
});


// Get all Groups
router.get('/', async (req, res) => {

  // const allGroups = await Group.findAll({
  //   attributes: [
  //     `id`, `organizerId`, `name`, `about`, `type`, `private`, `city`, `state`, `createdAt`, `updatedAt`
  //   ],
  //   include: [
  //     {
  //   }]

  // });

  const allGroups = await Group.findAll({
    include: [
      {
        model: User,
        attributes: [],
        as: 'Member'
      },
      {
        model: Image,
        attributes: [],
        where: { preview: true },
        required: false
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('`Member->GroupMember`.`id`')), 'numMembers'],
        [sequelize.col('Images.url'), 'previewUrl']
      ]
    },
    group: ['Group.id']
  });

  // const theQuery = "WITH `GroupPreviewImages` AS ( SELECT DISTINCT `Groups`.`id` , `Images`.`url` FROM `Groups` LEFT JOIN `Images` ON `Groups`.`id` = `Images`.`imageableId` AND `Images`.`imageableType` = 'Group' ) SELECT `Groups`.`id`, `Groups`.`organizerId`, `Groups`.`name`, `Groups`.`about`, `Groups`.`type`, `Groups`.`private`, `Groups`.`city`, `Groups`.`state`, `Groups`.`createdAt`, `Groups`.`updatedAt`, `GroupPreviewImages`.`url` AS `previewImage`, COUNT(*) AS `numMembers` FROM `Groups` LEFT JOIN `GroupPreviewImages` ON `Groups`.`id` = `GroupPreviewImages`.`id` LEFT JOIN `GroupMembers` ON `Groups`.`id` = `GroupMembers`.`groupId` LEFT JOIN `Users` ON `GroupMembers`.`userId` = `Users`.`id` GROUP BY `Groups`.`id` ORDER BY `Groups`.`id`";
  // const allGroups = await sequelize.query(theQuery);
  return res.json({Groups: allGroups});
});



module.exports = router;

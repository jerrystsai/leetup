// External
const express = require('express');
const { check } = require('express-validator');
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

// Edit an Event specified by its id
// router.put('/:eventId', requireAuth, validateEvent, async (req, res) => {
//   const { eventId } = req.params;
//   const userId = +req.user.id;
//   const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
//   // const clue = endDate.toDateTime();
//   console.log('price', typeof price);
//   console.log('startDate', typeof startDate);
//   console.log('endDate', typeof endDate);
//   // console.log('clue', clue);

//   const specificEvent = await Event.findByPk(eventId);
//   console.log(specificEvent);
//   const endDated = specificEvent.endDate;
//   const boundary = new Date('2021-11-19 15:00:00');
//   console.log('endDated', typeof endDated);
//   console.log('endDated', endDated instanceof Date);
//   console.log('endDated greater', endDated > boundary);
//   console.log('endDated less', endDated < boundary);
//   console.log('boundary', boundary);
//   console.log('endDated', endDated);

//   res.json({here: "here"})
  // const specificVenue = await Venue.findByPk(venueId);

  // if (!specificVenue) {
  //   res.status(404).json({
  //     message: "Venue couldn't be found"
  //   });
  // } else {
  //   const groupIdOfSpecificVenue = specificVenue.groupId;
  //   const selectedGroup = await Group.findByPk(groupIdOfSpecificVenue, {attributes: ['organizerId']});
  //   const groupCohosts = await GroupMember.findAll({
  //     attributes: ['userId'],
  //     where: {
  //       groupId: groupIdOfSpecificVenue,
  //       status: 'co-host'
  //     },
  //     raw: true
  //   });
  //   const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

  //   if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
  //     res.status(403).json({
  //       message: "Forbidden"
  //     });
  //   } else {
  //     const updatedVenue = await specificVenue.update(
  //       { groupId: groupIdOfSpecificVenue, address, city, state, lat, lng }
  //     );
  //     const updatedVenueConfirmed = await Venue.findByPk(venueId, {
  //     });

  //     res.status(200).json(updatedVenueConfirmed);
  //   }
  // }
// });


// Edit a Venue specified by its id
// router.put('/:venueId', requireAuth, validateVenue, async (req, res) => {
//   const { venueId } = req.params;
//   const userId = +req.user.id;
//   const { address, city, state, lat, lng } = req.body;

//   const specificVenue = await Venue.findByPk(venueId);

//   if (!specificVenue) {
//     res.status(404).json({
//       message: "Venue couldn't be found"
//     });
//   } else {
//     const groupIdOfSpecificVenue = specificVenue.groupId;
//     const selectedGroup = await Group.findByPk(groupIdOfSpecificVenue, {attributes: ['organizerId']});
//     const groupCohosts = await GroupMember.findAll({
//       attributes: ['userId'],
//       where: {
//         groupId: groupIdOfSpecificVenue,
//         status: 'co-host'
//       },
//       raw: true
//     });
//     const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

//     if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
//       res.status(403).json({
//         message: "Forbidden"
//       });
//     } else {
//       const updatedVenue = await specificVenue.update(
//         { groupId: groupIdOfSpecificVenue, address, city, state, lat, lng }
//       );
//       const updatedVenueConfirmed = await Venue.findByPk(venueId, {
//       });

//       res.status(200).json(updatedVenueConfirmed);
//     }
//   }
// });


// Get All Venues for a Group specified by its id

// router.get('/:groupId/venues', requireAuth, async (req, res) => {
//   const { groupId } = req.params;
//   const userId = +req.user.id;

//   const selectedGroup = await Group.findByPk(groupId, {attributes: ['organizerId']});
//   const groupCohosts = await GroupMember.findAll({
//     attributes: ['userId'],
//     where: {
//       groupId,
//       status: 'co-host'
//     },
//     raw: true
//   });
//   const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

//   if (!selectedGroup) {
//     res.status(404).json({
//       message: "Group couldn't be found"
//     });
//   } else if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
//     res.status(403).json({
//       message: "Forbidden"
//     });
//   } else {
//     const venuesOfSpecificGroup = await Group.findByPk(groupId, {
//       attributes: [],
//       include: [
//         {
//           model: Venues,
//           // attributes: ['id', 'firstName', 'lastName'],
//         }
//       ]
//     });

//     return venuesOfSpecificGroup ? res.json(venuesOfSpecificGroup): res.status(404).json({message: "Group couldn't be found"});
//   }

// });


// // Add an Image to a Group based on the Group's id
// router.post('/:groupId/images', requireAuth, validateImage, async (req, res) => {
//   const { groupId } = req.params;
//   const { url, preview } = req.body;
//   const userId = +req.user.id;

//   const specificGroup = await Group.findByPk(groupId, {
//     attributes: ['organizerId']
//   });

//   if (!specificGroup) {
//     res.status(404).json({
//       message: "Group couldn't be found"
//     });
//   } else if (userId !== specificGroup.organizerId) {
//     res.status(404).json({
//       message: "Forbidden"
//     });
//   } else {
//     const newImage = await Image.create(
//       {
//         url,
//         preview,
//         imageableId: groupId,
//         imageableType: 'Group'
//       }
//     );

//     const image = await Image.findByPk(newImage.id);

//     res.status(200).json(image);
//   }
// });

// // Get all Groups joined or organized by the Current User
// router.get('/me', requireAuth, async (req, res) => {
//   const allGroupsForUser = await Group.findAll({
//     include: [
//       {
//         model: User,
//         attributes: [],
//         as: 'Members'
//       },
//       {
//         model: Image,
//         attributes: [],
//         where: { preview: true },
//         required: false,
//         as: 'GroupImages'
//       }
//     ],
//     attributes: {
//       include: [
//         [sequelize.fn('COUNT', sequelize.col('`Members->GroupMember`.`id`')), 'numMembers'],
//         [sequelize.col('GroupImages.url'), 'previewUrl']
//       ]
//     },
//     group: ['Group.id'],
//     where: {
//       [Op.or]: [
//         { organizerId: Number(req.user.id) },
//         { '$`Members->GroupMember`.`userId`$': Number(req.user.id) }
//       ]
//     }
//   });

//   return res.json({Groups: allGroupsForUser});
// });

// // Get details of a Group from an id
// router.get('/:groupId', async (req, res) => {
//   const { groupId } = req.params;

//   const specificGroup = await Group.findByPk(groupId, {
//     include: [
//       {
//         model: Image,
//         // attributes: [],
//         where: { preview: true },
//         required: false,
//         as: 'GroupImages'
//       },
//       {
//         model: User,
//         // attributes: [],
//         as: 'Organizers'
//       },
//       {
//         model: User,
//         attributes: [],
//         as: 'Members'
//       },
//       {
//         model: Venue,
//         // attributes: []
//       }
//     ],
//     attributes: {
//       include: [
//         [sequelize.fn('COUNT', sequelize.col('`Members->GroupMember`.`id`')), 'numMembers'],
//       ]
//     },
//     group: ['Group.id']
//   });

//   return specificGroup ? res.json(specificGroup): res.status(404).json({message: "Group couldn't be found"});
// });

// // Edit a Group
// router.put('/:groupId', requireAuth, validateGroup, async (req, res) => {
//   const { groupId } = req.params;
//   const userId = +req.user.id;

//   const specificGroup = await Group.findByPk(groupId);

//   if (!specificGroup) {
//     res.status(404).json({
//       message: "Group couldn't be found"
//     });
//   } else if (userId !== specificGroup.organizerId) {
//     res.status(404).json({
//       message: "Forbidden"
//     });
//   } else {
//     const { name, about, type, private, city, state } = req.body;
//     const updatedGroup = await specificGroup.update(
//       { organizerId: userId, name, about, type, private, city, state }
//     );
//     res.status(200).json(updatedGroup);
//   }
// });

// // Delete a group
// router.delete('/:groupId', requireAuth, async (req, res) => {
//   const { groupId } = req.params;
//   const userId = +req.user.id;

//   const specificGroup = await Group.findByPk(groupId);

//   if (!specificGroup) {
//     res.status(404).json({
//       message: "Group couldn't be found"
//     });
//   } else if (userId !== specificGroup.organizerId) {
//     res.status(404).json({
//       message: "Forbidden"
//     });
//   } else {
//     const specificGroup = await Group.findByPk(groupId, {
//     });

//     await specificGroup.destroy();

//     res.status(200).json({message: "Successfully deleted"});
//   }
// });

// // Get all Groups
// router.get('/', async (req, res) => {
//   const allGroups = await Group.findAll({
//     include: [
//       {
//         model: User,
//         attributes: [],
//         as: 'Members'
//       },
//       {
//         model: Image,
//         attributes: [],
//         where: { preview: true },
//         required: false,
//         as: 'GroupImages'
//       }
//     ],
//     attributes: {
//       include: [
//         [sequelize.fn('COUNT', sequelize.col('`Members->GroupMember`.`id`')), 'numMembers'],
//         [sequelize.col('GroupImages.url'), 'previewUrl']
//       ]
//     },
//     group: ['Group.id']
//   });

//   return res.json({Groups: allGroups});
// });


// Get all Events
router.get('/', async (req, res) => {
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
    group: ['Event.id']
  });

  return res.json({Events: allEvents});
});


// // Create a Group
// router.post('/', requireAuth, validateGroup, async (req, res) => {
//   const { name, about, type, private, city, state } = req.body;
//   const organizerId = +req.user.id;
//   const group = await Group.create({ organizerId, name, about, type, private, city, state });

//   res.status(201).json(group);
// });

module.exports = router;

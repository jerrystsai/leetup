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
  validateEvent,
  validateImage,
  validateGroupId
} = require('../../utils/validation');

const { User, Group, Image, Venue, GroupMember, Event, EventAttendee } = require('../../db/models');
const { sequelize } = require('../../db/models');

const router = express.Router();

//
// ROUTE HANDLING
//

// Get all Attendees of an Event specified by its id
router.get('/:eventId/attendees', async (req, res) => {
  const { eventId } = req.params;
  const userId = +req.user.id;

  const selectedEvent = await Event.findByPk(eventId, {
    attributes: [],
    include: [
        {
          model: User,
          as: 'Attendees',
          through: {
            attributes: ['status'],
            as: 'Attendance'
          }
        },
      ],
  });

  if (!selectedEvent) {
    res.status(404).json({
      message: "Event couldn't be found"
    });
  } else {
    // const selectedEventAttendees = selectedEvent.toJSON()['Attendees'];
    // const selectedEventAttendeessArray = selectedEventUsers.map( attendeeObj => attendeeObj.id);
    const selectedEventGroupId = await Event.findByPk(eventId);
    const groupIdOfSelectedEvent = selectedEventGroupId.groupId;

    const selectedGroup = await Group.findByPk(groupIdOfSelectedEvent, {attributes: ['organizerId']});
    const groupCohosts = await GroupMember.findAll({
      attributes: ['userId'],
      where: {
        groupId: groupIdOfSelectedEvent,
        status: 'co-host'
      },
      raw: true
    });
    const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

    if (selectedGroup.organizerId === userId || groupCohostsArray.includes(userId)) {
      res.status(200).json(selectedEvent);
    } else {
      const selectedEventWithoutPending = await Event.findByPk(eventId, {
        attributes: [],
        include: [
            {
              model: User,
              as: 'Attendees',
              through: {
                attributes: ['status'],
                as: 'Attendance',
                where: { [Op.not]: { status: 'pending' }}
              }
            },
          ],
      });
      res.status(200).json(selectedEventWithoutPending);
    }
  }
});

// Request to Attend an Event based on the Event's id
router.post('/:eventId/attendees', requireAuth, async (req, res) => {
  const { eventId } = req.params;
  const userId = +req.user.id;

  const selectedEvent = await Event.findByPk(eventId);

  if (!selectedEvent) {
    res.status(404).json({
      message: "Event couldn't be found"
    });
  } else {
    const groupId = selectedEvent.groupId;
    const userGroupMembership = await GroupMember.findAll(
      {where: {
        [Op.and]: [
          {groupId},
          {userId},
          { [Op.or]: [
            {status: 'member'},
            {status: 'co-host'}
          ]}
        ]}
      }
    );
    const userEventAttendance = await EventAttendee.findAll(
      {where: {eventId, userId}}
    );

    if (userGroupMembership.length === 0) {
      res.status(403).json({
        message: "Forbidden"
      });
    } else {
      if (userEventAttendance.length > 0) {
        // console.log('--- userEventAttendanceStatus', userEventAttendance);

        const userEventAttendanceStatus = userEventAttendance[0].status;
        if (userEventAttendanceStatus === 'pending' || userEventAttendanceStatus === 'waitlist') {
          res.status(400).json({
            message: "Attendance has already been requested"
          });
        } else if (userEventAttendanceStatus === 'attending') {
          res.status(400).json({
            message: "User is already an attendee of the event"
          });
        }
      } else {
        const updateSelectedEventAttendee = await EventAttendee.create(
          {
            eventId,
            userId,
            status: 'pending'
          }
        );

        const selectedEventAttendeeArray = await EventAttendee.findAll({
          attributes: ['userId', 'status'],
          where: {
            [Op.and]: [{eventId}, {userId}]
          }
        });

        const selectedEventAttendee = selectedEventAttendeeArray[0];

        res.status(200).json(selectedEventAttendee);
      }
    }
  }
});


// Change the status of an attendance for an event specified by id
router.put('/:eventId/attendees', requireAuth, async (req, res) => {
  const { eventId } = req.params;
  const userId = +req.user.id;
  const { userId: attendeeId, status } = req.body

  const selectedEvent = await Event.findByPk(eventId, {
    attributes: [],
    include: [
        {
          model: User,
          as: 'Attendees',
          through: {
            attributes: ['status'],
            as: 'Attendance'
          }
        },
      ],
  });

  if (!selectedEvent) {
    res.status(404).json({
      message: "Event couldn't be found"
    });
  } else {
    const selectedEventGroupId = await Event.findByPk(eventId);
    const groupIdOfSelectedEvent = selectedEventGroupId.groupId;

    const selectedGroup = await Group.findByPk(groupIdOfSelectedEvent, {attributes: ['organizerId']});
    const groupCohosts = await GroupMember.findAll({
      attributes: ['userId'],
      where: {
        groupId: groupIdOfSelectedEvent,
        status: 'co-host'
      },
      raw: true
    });
    const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

    if (!selectedGroup.organizerId === userId && !groupCohostsArray.includes(userId)) {
      res.status(403).json({
        message: "Forbidden"
      });
    } else if (status === 'pending') {
      res.status(400).json({
        message: "Cannot change an attendance status to pending"
      });
    } else {
      const selectedEventAttendeeArray = await EventAttendee.findAll({
        attributes: ['userId', 'status'],
        where: {
          [Op.and]: [{eventId}, {userId: attendeeId}]
        }
      });
      if (selectedEventAttendeeArray.length === 0) {
        res.status(400).json({
          message: "Attendance between the user and the event does not exist"
        });
      } else {
        const updatedSelectedEventAttendee = await EventAttendee.update(
          { status },
          {
            where: {
              [Op.and]: [{eventId}, {userId: attendeeId}]
            }
          }
        );

        const selectedEventAttendeeArrayConfirmed = await EventAttendee.findAll({
          attributes: ['userId', 'status'],
          where: {
            [Op.and]: [{eventId}, {userId: attendeeId}]
          }
        });

        const selectedEventAttendee = selectedEventAttendeeArrayConfirmed[0];

        res.json(selectedEventAttendee);
      }
    }
  }
});


// Add an Image to a Event based on the Event's id
router.post('/:eventId/images', requireAuth, validateImage, async (req, res) => {
  const { eventId } = req.params;
  const { url, preview } = req.body;
  const userId = +req.user.id;

  const selectedEvent = await Event.findByPk(eventId, {
    attributes: ['groupId'],
    include: [
      {
        model: User,
        attributes: ['id'],
        as: 'Attendees',
        through: {
          attributes: [],
          as: 'Attendance',
          where: { status: 'attending' }
        },
      }
    ]
  });

  if (!selectedEvent) {
    res.status(404).json({
      message: "Event couldn't be found"
    });
  } else {
    const selectedEventUsers = selectedEvent.toJSON()['Attendees'];
    const selectedEventUsersArray = selectedEventUsers.map( attendeeObj => attendeeObj.id);

    const groupIdOfSelectedEvent = selectedEvent.groupId;

    const selectedGroup = await Group.findByPk(groupIdOfSelectedEvent, {attributes: ['organizerId']});
    const groupCohosts = await GroupMember.findAll({
      attributes: ['userId'],
      where: {
        groupId: groupIdOfSelectedEvent,
        status: 'co-host'
      },
      raw: true
    });
    const groupCohostsArray = groupCohosts.map( cohostObj => cohostObj.userId);

    if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId) && !selectedEventUsersArray.includes(userId)) {
      res.status(403).json({
        message: "Forbidden"
      });
    } else {
      const newImage = await Image.create(
        {
          url,
          preview,
          imageableId: eventId,
          imageableType: 'Event'
        }
      );

      const image = await Image.findByPk(newImage.id);
      res.status(200).json(image);
    }
  }
});

// Get details of an Event specified by its id
router.get('/:eventId', async (req, res) => {
  const { eventId } = req.params;

  const selectedEvent = await Event.findByPk(eventId, {
  include: [
      {
        model: User,
        attributes: [],
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
        [sequelize.fn('COUNT', sequelize.col('`Users->EventAttendee`.`id`')), 'numAttending']
      ]
    },
    group: ['Event.id']
  });

  if (!selectedEvent) {
    res.status(404).json({
      message: "Event couldn't be found"
    });
  } else {
    const eventImages = await Image.findAll(
      {where: {[Op.and]: [{'imageableId': eventId}, {'imageableType': 'Event'}]}}
    )
    const selectedEventJSON = selectedEvent.toJSON();
    selectedEventJSON['EventImages'] = eventImages;
    return res.json(selectedEventJSON);
  }
});

// Edit a Event
router.put('/:eventId', requireAuth, validateEvent, async (req, res) => {
  const { eventId } = req.params;
  const userId = +req.user.id;

  const selectedEvent = await Event.findByPk(eventId);

  if (!selectedEvent) {
    res.status(404).json({
      message: "Event couldn't be found"
    });
  } else {
    const groupIdOfSelectedEvent = selectedEvent.groupId;

    const selectedGroup = await Group.findByPk(groupIdOfSelectedEvent, {attributes: ['organizerId']});
    const groupCohosts = await GroupMember.findAll({
      attributes: ['userId'],
      where: {
        groupId: groupIdOfSelectedEvent,
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
      const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
      const selectedVenue = await Venue.findByPk(venueId);

      if (!selectedVenue && venueId !== null) {
        res.status(404).json({
          message: "Venue couldn't be found"
        });
      } else {
        const updatedEvent = await selectedEvent.update(
          { venueId, name, type, capacity, price, description, startDate, endDate }
        );

        const updatedEventConfirm = await Event.findByPk(updatedEvent.id);
        res.status(200).json(updatedEventConfirm);
      }
    }
  }
});

// Get all Events
router.get('/', async (req, res) => {
  const allEvents = await Event.findAll({
  include: [
      {
        model: Image,
        attributes: ['url'],
        where: { preview: true },
        required: false,
        as: 'EventImages'
      },
      {
        model: Group,
        attributes: ['id', 'name', 'city', 'state'],
      },
      {
        model: Venue,
        attributes: ['id', 'city', 'state'],
      }
    ],
    attributes: {
      exclude: ['description', 'capacity', 'price']
    },
  });

  const allEventsArray = allEvents.map(event => {
    const eventData = event.dataValues;
    eventData['previewImage'] = eventData['EventImages'].length > 0 ? eventData.EventImages[0]['url'] : null;
    delete eventData['EventImages']
    return eventData;
  });

  const allEventsAttendeesCount = await EventAttendee.findAll({
    attributes: ['eventId', [sequelize.fn('COUNT', 'eventId'), 'numAttending']],
    where: {status: ['attending']},
    group: ['eventId']
  });

  const allEventsArrayGrafted = graftValues(allEventsArray, 'id', allEventsAttendeesCount, 'eventId', 'numAttending', 0);

  return res.json({Events: allEventsArrayGrafted});
});


// // Create a Group
// router.post('/', requireAuth, validateGroup, async (req, res) => {
//   const { name, about, type, private, city, state } = req.body;
//   const organizerId = +req.user.id;
//   const group = await Group.create({ organizerId, name, about, type, private, city, state });

//   res.status(201).json(group);
// });

module.exports = router;

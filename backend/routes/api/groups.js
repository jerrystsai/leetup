// External
const express = require('express');
// const { check } = require('express-validator');
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
  validateGroupId,
  validateMemberStatus,
  validateAttendeeStatus,
  validateMemberId,
  validateUserId,
} = require('../../utils/validation');

const { User, Group, Image, Venue, GroupMember, Event, EventAttendee } = require('../../db/models');
const { sequelize } = require('../../db/models');

const router = express.Router();

//
// ROUTE HANDLING
//

// Delete an Image for a Group
router.delete('/:groupId/images/:imageId', requireAuth, async (req, res) => {
  const { groupId, imageId } = req.params;
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
    const selectedImage = await Image.findOne({
      attributes: ['id', 'imageableId', 'imageableType'],
      where: {
        id: imageId,
        imageableId: groupId,
        imageableType: 'Group'
      }
    });

    if (!selectedImage) {
      res.status(404).json({
        message: "Group Image couldn't be found"
      });
    } else {
      await selectedImage.destroy();

      res.status(200).json({
        message: "Successfully deleted"
      });
    }
  }
});


// Get all Members of a Group specified by its id
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
  } else {
    const membersOfSpecificGroup = await GroupMember.findAll({
        attributes: ['userId', 'status'],
        where: { groupId }
      }).then(res => {
        if (res) {
          return res.map( memberObj => memberObj.userId);
        } else {
          return null;
        }
      });

    const membersStatusOfSpecificGroup = await GroupMember.findAll({
      attributes: ['userId', 'status'],
      where: { groupId }
    }).then(res => res.reduce( (dict, memberObj) => {
      dict[memberObj.userId] = memberObj.status;
      return dict;
    }, {} ));

    const mmembersUserInfo = await User.findAll({
      attributes: ['id', 'firstName', 'lastName'],
      where: {id: membersOfSpecificGroup},
      raw: true
    });

    const membersInfo = mmembersUserInfo.map( memObj => {
      memObj['Membership'] = {'status': membersStatusOfSpecificGroup[memObj.id]};
      return memObj;
    });

    if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId)) {
      const membersInfoWithoutPending = membersInfo.filter( memObj => memObj.Membership.status !== 'pending');
      res.status(200).json({"Members": membersInfoWithoutPending});
    } else {
      res.status(200).json({"Members": membersInfo});
    }
  }
});

// Change the status of a membership for a group specified by id
router.put('/:groupId/members', requireAuth, validateMemberStatus, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;
  const { memberId, status } = req.body;

  const selectedUser = await User.findByPk(userId, {});

  const selectedUserSelectedGroupMembership = await GroupMember.findOne({
    attributes: ['status'],
    where: {groupId, userId}
  }).then(res => res ? res.toJSON() : null);

  const selectedMember = await User.findByPk(memberId).then(res => res ? res.toJSON() : null);

  const selectedMemberSelectedGroupMembership = await GroupMember.findOne({
    attributes: ['status'],
    where: {groupId, userId: memberId}
  }).then(res => res ? res.toJSON() : null);

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
  } else if (!selectedMember) {
    res.status(404).json({
      message: "Validation Error",
      errors: {
        "memberId": "User couldn't be found"
      }
    });
  } else if (status === 'pending') {
    res.status(400).json({
      message: "Validations Error",
      errors: {
        status: "Cannot change a membership status to pending"
      }
    })
  } else if (!selectedMemberSelectedGroupMembership) {
    res.status(404).json({
      message: "Membership between the user and the group does not exist"
    });
  } else {
    const selectedGroupOrganizerId = selectedGroup['organizerId'];
    const groupStatusOfSelectedMember = selectedMemberSelectedGroupMembership.status;

    if (
        (userId === selectedGroupOrganizerId || groupCohostsArray.includes(userId)) &&
        (groupStatusOfSelectedMember === 'pending' && (status === 'member'))
      ) {
        const updateSelectedGroupMember = await GroupMember.update(
          { status },
          {
            where: {
              [Op.and]: [{groupId}, {userId: memberId}]
            }
          }
        );

        const selectedGroupMember = await GroupMember.findOne({
          attributes: ['id', 'groupId', 'userId', 'status'],
          where: {
            [Op.and]: [{groupId}, {userId: memberId}]
          }
        });

        res.status(200).json(selectedGroupMember);

    } else if (
        (userId === selectedGroupOrganizerId) &&
        (
          ((groupStatusOfSelectedMember === 'pending' || groupStatusOfSelectedMember === 'member') && status === 'co-host') ||
          ((groupStatusOfSelectedMember === 'co-host') && status === 'member')
        )
      ) {
        const updateSelectedGroupMember = await GroupMember.update(
          { status },
          {
            where: {
              [Op.and]: [{groupId}, {userId: memberId}]
            }
          }
        );

        const selectedGroupMember = await GroupMember.findOne({
          attributes: ['id', 'groupId', 'userId', 'status'],
          where: {
            [Op.and]: [{groupId}, {userId: memberId}]
          }
        });

        res.status(200).json(selectedGroupMember);

      } else if (
        (userId === selectedGroupOrganizerId || groupCohostsArray.includes(userId)) &&
        (groupStatusOfSelectedMember === status)
      ) {
      const selectedGroupMember = await GroupMember.findOne({
        attributes: ['id', 'groupId', 'userId', 'status'],
        where: {
          [Op.and]: [{groupId}, {userId: memberId}]
        }
      });
      res.status(200).json(selectedGroupMember);
    } else {
      res.status(403).json({
        message: "Forbidden"
      });
    }
  }
});

// sqlite-working code
//
// router.put('/:groupId/members', requireAuth, async (req, res) => {
//   const { groupId } = req.params;
//   const userId = +req.user.id;
//   const { memberId, status } = req.body;

//   const selectedUser = await User.findByPk(userId, {});

//   const theQuery1 =
//     'SELECT `GroupMembers`.`status` FROM `Users` INNER JOIN `GroupMembers` ON `Users`.`id` = `GroupMembers`.`userId` WHERE `Users`.`id` = ' + `${userId}` + ' AND `GroupMembers`.`groupId` = ' + `${groupId}`;
//   const selectedUserSelectedGroupMembership = await sequelize.query(theQuery1);

//   const selectedMember = await User.findByPk(memberId, {
//     include: [
//       {
//         model: Group,
//         as: 'Groups',
//         through: {
//           attributes: ['status'],
//           as: 'Membership'
//         }
//       }
//     ]
//   });

//   const theQuery2 =
//     'SELECT `GroupMembers`.`status` FROM `Users` INNER JOIN `GroupMembers` ON `Users`.`id` = `GroupMembers`.`userId` WHERE `Users`.`id` = ' + `${memberId}` + ' AND `GroupMembers`.`groupId` = ' + `${groupId}`;
//   const selectedMemberSelectedGroupMembership = await sequelize.query(theQuery2);

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

//   if (selectedUserSelectedGroupMembership[0].length === 0) {
//     res.status(403).json({
//       message: "Forbidden"
//     });
//   } else if (!selectedGroup) {
//     res.status(404).json({
//       message: "Group couldn't be found"
//     });
//   } else if (!selectedMember) {
//     res.status(404).json({
//       message: "Validation Error",
//       errors: {
//         "memberId": "User couldn't be found"
//       }
//     });
//   } else if (status === 'pending') {
//     res.status(400).json({
//       message: "Validations Error",
//       errors: {
//         status: "Cannot change a membership status to pending"
//       }
//     })
//   } else if (selectedMemberSelectedGroupMembership[0].length === 0) {
//     res.status(404).json({
//       message: "Membership between the user and the group does not exist"
//     });
//   } else {
//     const selectedGroupOrganizerId = selectedGroup['organizerId'];
//     const groupStatusOfSelectedMember = selectedMember['Groups'][0]['Membership']['status'];

//     if (
//         (userId === selectedGroupOrganizerId || groupCohostsArray.includes(userId)) &&
//         (groupStatusOfSelectedMember === 'pending' && (status === 'member'))
//       ) {
//         const updateSelectedGroupMember = await GroupMember.update(
//           { status },
//           {
//             where: {
//               [Op.and]: [{groupId}, {userId: memberId}]
//             }
//           }
//         );

//         const selectedGroupMember = await GroupMember.findOne({
//           attributes: ['id', 'groupId', 'userId', 'status', 'createdAt', 'updatedAt'],
//           where: {
//             [Op.and]: [{groupId}, {userId: memberId}]
//           }
//         });

//         res.status(200).json(selectedGroupMember);

//     } else if (
//         (userId === selectedGroupOrganizerId) &&
//         (
//           ((groupStatusOfSelectedMember === 'pending' || groupStatusOfSelectedMember === 'member') && status === 'co-host') ||
//           ((groupStatusOfSelectedMember === 'co-host') && status === 'member')
//         )
//       ) {
//         const updateSelectedGroupMember = await GroupMember.update(
//           { status },
//           {
//             where: {
//               [Op.and]: [{groupId}, {userId: memberId}]
//             }
//           }
//         );

//         const selectedGroupMember = await GroupMember.findOne({
//           attributes: ['id', 'groupId', 'userId', 'status', 'createdAt', 'updatedAt'],
//           where: {
//             [Op.and]: [{groupId}, {userId: memberId}]
//           }
//         });

//         res.status(200).json(selectedGroupMember);

//       } else if (
//         (userId === selectedGroupOrganizerId || groupCohostsArray.includes(userId)) &&
//         (groupStatusOfSelectedMember === status)
//       ) {
//       const selectedGroupMember = await GroupMember.findOne({
//         attributes: ['id', 'groupId', 'userId', 'status'],
//         where: {
//           [Op.and]: [{groupId}, {userId: memberId}]
//         }
//       });
//       res.status(200).json(selectedGroupMember);
//     } else {
//       res.status(403).json({
//         message: "Forbidden"
//       });
//     }
//   }
// });


// Delete membership to a group specified by id
router.delete('/:groupId/members', requireAuth, validateMemberId, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;
  const { memberId } = req.body;

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
  const selectedMember = await User.findByPk(memberId);
  const selectedMemberGroupMembership = await GroupMember.findOne({
    attributes: ['id', 'groupId', 'userId', 'status'],
    where: {groupId, userId: memberId}
  });

  if (!selectedMember) {
    res.status(400).json({
      message: "Validation Error",
      errors: {
        memberId: "User couldn't be found"
      }
    });
  } else if (!selectedGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else if (selectedGroup.organizerId !== userId && !groupCohostsArray.includes(userId) && userId !== memberId) {
    res.status(403).json({
      message: "Forbidden"
    });
  } else if (!selectedMemberGroupMembership) {
    res.status(404).json({
      message: "Membership does not exist for this User"
    });
  } else {
    await selectedMemberGroupMembership.destroy();
    res.status(200).json({message: "Successfully deleted membership from group"});
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

router.get('/:groupId/events', async (req, res) => {
  // const { groupId } = req.params;
  const groupId = Number(req.params.groupId);

  const selectedGroup = await Group.findByPk(groupId, {attributes: ['organizerId']});

  if (!selectedGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    })
  } else {
    const allEventsForGroup = await Event.findAll({
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
      where: { groupId }
    });

    const allEventsForGroupArray = allEventsForGroup.map(event => {
      const eventData = event.dataValues;
      eventData['previewImage'] = eventData['EventImages'].length > 0 ? eventData.EventImages[0]['url'] : null;
      delete eventData['EventImages']
      return eventData;
    });

    const allEventsForGroupAttendeesCount = await EventAttendee.findAll({
      attributes: ['eventId', [sequelize.fn('COUNT', 'eventId'), 'numAttending']],
      where: {status: ['attending']},
      group: ['eventId']
    });

    const allEventsForGroupArrayGrafted = graftValues(allEventsForGroupArray, 'id', allEventsForGroupAttendeesCount, 'eventId', 'numAttending', 0);

    return res.json({Events: allEventsForGroupArrayGrafted});
  }

// sqlite-working version
//
// router.get('/:groupId/events', async (req, res) => {
//   const { groupId } = req.params;

//   const selectedGroup = await Group.findByPk(groupId, {attributes: ['organizerId']});

//   if (!selectedGroup) {
//     res.status(404).json({
//       message: "Group couldn't be found"
//     })
//   } else {
//     const allEvents = await Event.findAll({
//     include: [
//         {
//           model: User,
//           attributes: [],
//         },
//         {
//           model: Image,
//           attributes: [],
//           where: { preview: true },
//           required: false,
//           as: 'EventImages'
//         },
//         {
//           model: Group,
//           attributes: ['id', 'name', 'city', 'state'],
//           // as: 'Members'
//         },
//         {
//           model: Venue,
//           attributes: ['id', 'city', 'state'],
//           // as: 'Members'
//         }
//       ],
//       attributes: {
//         include: [
//           [sequelize.fn('COUNT', sequelize.col('`Users->EventAttendee`.`id`')), 'numAttending'],
//           [sequelize.col('EventImages.url'), 'previewImage']
//         ],
//         exclude: ['description', 'capacity', 'price']
//       },
//       group: ['Event.id'],
//       where: { groupId }
//     });
//   }
//   return res.json({Events: allEvents});
// }
});

// Request a Membership for a Group based on the Group's id
router.post('/:groupId/members', requireAuth, async (req, res) => {
  const { groupId } = req.params;
  const userId = +req.user.id;

  const selectedGroup = await Group.findByPk(groupId);

  if (!selectedGroup) {
    res.status(404).json({
      message: "Group couldn't be found"
    });
  } else {
    const selectedUserGroupInfo = await GroupMember.findOne({
      attributes: ['groupId', 'userId', 'status'],
      where: {groupId, userId}
    }).then(res => res ? res.toJSON() : null);

    if (selectedUserGroupInfo) {
      const statusOfSelectedUser = selectedUserGroupInfo.status;

      if (statusOfSelectedUser === 'pending') {
        res.status(400).json({
          message: "Membership has already been requested"
        });
      } else if (statusOfSelectedUser === 'co-host' || statusOfSelectedUser === 'member') {
        res.status(400).json({
          message: "User is already a member of the group"
        });
      }
    } else {
      const newGroupMember = await GroupMember.create({ groupId, userId, status: 'pending' });
      const newGroupMemberConfirmed = await GroupMember.findByPk(newGroupMember.id, {
        attributes: [['userId', 'memberId'], 'status']
      });
      res.status(200).json(newGroupMemberConfirmed);
    }
  }
});

// sqlite-working code
//
// router.post('/:groupId/members', requireAuth, async (req, res) => {
//   const { groupId } = req.params;
//   const userId = +req.user.id;

//   const selectedGroup = await Group.findByPk(groupId);

//   if (!selectedGroup) {
//     res.status(404).json({
//       message: "Group couldn't be found"
//     });
//   } else {
//     const selectedUser = await Group.findByPk(groupId, {
//       attributes: [],
//       include: [
//         {
//           model: User,
//           as: 'Members',
//           attributes: ['id', 'firstName', 'lastName'],
//           through: {
//             attributes: ['status'],
//             as: 'Membership'
//           },
//           where: {id: userId}
//         }
//       ]
//     });

//     if (selectedUser) {
//       const statusOfSelectedUser = selectedUser.Members[0].Membership.status;

//       if (statusOfSelectedUser === 'pending') {
//         res.status(400).json({
//           message: "Membership has already been requested"
//         });
//       } else if (statusOfSelectedUser === 'co-host' || statusOfSelectedUser === 'member') {
//         res.status(400).json({
//           message: "User is already a member of the group"
//         });
//       }
//     } else {
//       const newGroupMember = await GroupMember.create({ groupId, userId, status: 'pending' });
//       const newGroupMemberConfirmed = await GroupMember.findByPk(newGroupMember.id, {
//         attributes: [['userId', 'memberId'], 'status']
//       });
//       res.status(200).json(newGroupMemberConfirmed);
//     }
//   }
// });


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
  const groupCohostsArray = groupCohosts.map(cohostObj => cohostObj.userId);

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

    const newEvent = await Event.create({ groupId, venueId, name, type, capacity: Number(capacity), price: Number(price), description, startDate, endDate });
    const newEventConfirmed = await Event.findByPk(newEvent.id, {
    });
    newEventConfirmed.price = +newEventConfirmed.price;

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
  const userId = req.user.id;
  // where: {
  //     [Op.or]: [
  //       { organizerId: Number(req.user.id) },
  //       { '$`Members->GroupMember`.`userId`$': Number(req.user.id) }
  //     ]

  // Current user, group memberships
  const groupsJoinedByCurrentUser = await GroupMember.findAll({
    attributes: ['groupId', 'status'],
    where: {userId, status: ['co-host', 'member']}
  })
  const groupsJoinedByCurrentUserArray = findAllResultToArray(groupsJoinedByCurrentUser);
  const groupNumbersJoinedByCurrentUser = groupsJoinedByCurrentUserArray.map( ele => ele.groupId);

  // Current user, group organizer
  const groupsOrganizedByCurrentUser = await Group.findAll({
    attributes: ['id'],
    where: {organizerId: userId}
  })
  const groupsOrganizedByCurrentUserArray = findAllResultToArray(groupsOrganizedByCurrentUser);
  const groupNumbersOrganizedByCurrentUser = groupsOrganizedByCurrentUserArray.map( ele => ele.id);

  const groupNumbersAssociatedToCurrentUser = [...new Set([...groupNumbersJoinedByCurrentUser, ...groupNumbersOrganizedByCurrentUser])]

  const allGroupsAssocToCurrentUser = await Group.findAll({
    where: {id: groupNumbersAssociatedToCurrentUser},
    include: [
      {
        model: Image,
        attributes: ['url'],
        where: { preview: true },
        required: false,
        as: 'GroupImages'
      }
    ],
  });

  const allGroupsArray = allGroupsAssocToCurrentUser.map(group => {
    const groupData = group.dataValues;
    groupData['previewImage'] = groupData['GroupImages'].length > 0 ? groupData.GroupImages[0]['url'] : null;
    delete groupData['GroupImages']
    return groupData;
  });

  const allGroupsMembersCount = await GroupMember.findAll({
    attributes: ['groupId', [sequelize.fn('COUNT', 'groupId'), 'numMembers']],
    where: {status: ['co-host', 'member'], groupId: groupNumbersAssociatedToCurrentUser},
    group: ['groupId']
  });

  const allGroupsArrayGrafted = graftValues(allGroupsArray, 'id', allGroupsMembersCount, 'groupId', 'numMembers', 0);

  return res.json({Groups: allGroupsArrayGrafted});

  // sqlite-working code
  //
  // const allGroupsForUser = await Group.findAll({
  //   include: [
  //     {
  //       model: User,
  //       attributes: [],
  //       as: 'Members'
  //     },
  //     {
  //       model: Image,
  //       attributes: [],
  //       where: { preview: true },
  //       required: false,
  //       as: 'GroupImages'
  //     }
  //   ],
  //   attributes: {
  //     include: [
  //       [sequelize.fn('COUNT', sequelize.col('`Members->GroupMember`.`id`')), 'numMembers'],
  //       [sequelize.col('GroupImages.url'), 'previewUrl']
  //     ]
  //   },
  //   group: ['Group.id'],
  //   where: {
  //     [Op.or]: [
  //       { organizerId: Number(req.user.id) },
  //       { '$`Members->GroupMember`.`userId`$': Number(req.user.id) }
  //     ]
  //   }
  // });

  // return res.json({Groups: allGroupsForUser});
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
        attributes: ['id', 'firstName', 'lastName'],
        as: 'Organizer'
      },
      {
        model: Venue,
        // attributes: []
      }
    ],
  });

  const specificGroupMemberCount = await GroupMember.findAll({
    where: {status: ['co-host', 'member'], groupId},
  });

  if (specificGroup) {
    specificGroup.dataValues['numMembers'] = specificGroupMemberCount.length;
    res.json(specificGroup);
  } else {
    res.status(404).json({message: "Group couldn't be found"});
  }
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
    const updatedSpecificGroup = await specificGroup.update(
      { organizerId: userId, name, about, type, private, city, state }
    );
    res.status(200).json(updatedSpecificGroup);
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
    const groupEvents = await Event.findAll({
      attributes: ['id'],
      where: { groupId },
      raw: true,
      nested: true
    });

    const groupEventIds = groupEvents.map( idObj => idObj.id );

    await EventAttendee.destroy(
      { where: {eventId: groupEventIds} }
    );

    await GroupMember.destroy(
      { where: {groupId} }
    );

    await Image.destroy(
      { where: {imageableId: groupId} }
    );

    await Event.destroy(
      { where: {groupId} }
    );

    await Venue.destroy(
      { where: {groupId} }
    );

    await Group.destroy(
      { where: {id: groupId} }
    );

    // const specificGroup = await Group.findByPk(groupId);
    // await specificGroup.destroy();
    res.status(200).json({message: "Successfully deleted"});
  }
});


// Get all Groups
router.get('/', async (req, res) => {
  const allGroups = await Group.findAll({
    include: [
      {
        model: Image,
        attributes: ['url'],
        where: { preview: true },
        required: false,
        as: 'GroupImages'
      }
    ],
  });

  const allGroupsArray = allGroups.map(group => {
    const groupData = group.dataValues;
    groupData['previewImage'] = groupData['GroupImages'].length > 0 ? groupData.GroupImages[0]['url'] : null;
    delete groupData['GroupImages']
    return groupData;
  });

  const allGroupsMembersCount = await GroupMember.findAll({
    attributes: ['groupId', [sequelize.fn('COUNT', 'groupId'), 'numMembers']],
    where: {status: ['co-host', 'member']},
    group: ['groupId']
  });

  const allGroupsArrayGrafted = graftValues(allGroupsArray, 'id', allGroupsMembersCount, 'groupId', 'numMembers', 0);

  return res.json({Groups: allGroupsArrayGrafted});

// sqlite-working code
//
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
});

// Create a Group
router.post('/', requireAuth, validateGroup, async (req, res) => {
  const { name, about, type, private, city, state } = req.body;
  const organizerId = +req.user.id;
  const group = await Group.create({ organizerId, name, about, type, private, city, state });

  res.status(201).json(group);
});

module.exports = router;

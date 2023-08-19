'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'EventAttendees';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   return queryInterface.bulkInsert(options, [
      {
        eventId: 1,
        userId: 1,
        status: 'pending',
      },
      {
        eventId: 1,
        userId: 2,
        status: 'waitlist',
      },
      {
        eventId: 1,
        userId: 6,
        status: 'attending',
      },
      {
        eventId: 2,
        userId: 2,
        status: 'attending',
      },
      {
        eventId: 3,
        userId: 1,
        status: 'attending',
      },
      {
        eventId: 3,
        userId: 3,
        status: 'pending',
      },
      {
        eventId: 4,
        userId: 3,
        status: 'pending',
      },
      {
        eventId: 4,
        userId: 4,
        status: 'attending',
      }
   ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const Op = Sequelize.Op;
    const selectEventAttendees = [
      {eventId: 1, userId: 1},
      {eventId: 1, userId: 2},
      {eventId: 2, userId: 2},
      {eventId: 3, userId: 1},
      {eventId: 3, userId: 3},
      {eventId: 4, userId: 3},
      {eventId: 4, userId: 4},
    ];

    return queryInterface.bulkDelete(options, {
      [Op.or]: selectEventAttendees
    }, {});
  }
};

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
        status: 'attending',
      },
      {
        eventId: 1,
        userId: 2,
        status: 'waitlist',
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
    ];

    return queryInterface.bulkDelete(options, {
      [Op.or]: selectEventAttendees
    }, {});
  }
};
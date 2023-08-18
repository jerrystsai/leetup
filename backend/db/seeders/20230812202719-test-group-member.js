'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'GroupMembers';

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
        groupId: 1,
        userId: 1,
        status: 'member',
      },
      {
        groupId: 1,
        userId: 2,
        status: 'co-host',
      },
      {
        groupId: 1,
        userId: 4,
        status: 'pending',
      },
      {
        groupId: 2,
        userId: 1,
        status: 'co-host',
      },
      {
        groupId: 3,
        userId: 3,
        status: 'co-host',
      },
      {
        groupId: 3,
        userId: 4,
        status: 'pending',
      },
      {
        groupId: 3,
        userId: 5,
        status: 'member',
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
    const selectGroupMembers = [
      {groupId: 1, userId: 1},
      {groupId: 1, userId: 2},
      {groupId: 1, userId: 4},
      {groupId: 2, userId: 1},
      {groupId: 3, userId: 3},
      {groupId: 3, userId: 4},
      {groupId: 3, userId: 5},
    ];

    return queryInterface.bulkDelete(options, {
      [Op.or]: selectGroupMembers
    }, {});
  }
};

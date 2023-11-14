'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Events';

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
        venueId: null,
        name: 'Tennis Group First Meet and Greet',
        description: 'First meet and greet event for the evening tennis on the water group! Join us online for happy times!',
        type: 'Online',
        capacity: 30,
        price: 0,
        startDate: '2021-11-18 20:00:00',
        endDate: '2021-11-18 22:00:00',
      },
      {
        groupId: 1,
        venueId: 1,
        name: 'Tennis Singles',
        description: 'Meet in person to play tennis and socialize',
        type: 'In person',
        capacity: 50,
        price: 5,
        startDate: '2021-11-19 20:00:00',
        endDate: '2021-11-19 22:00:00',
      },
      {
        groupId: 2,
        venueId: 3,
        name: 'Dog Park',
        description: 'Have dogs play together and have fun -- yay !!!!',
        type: 'In person',
        capacity: 35,
        price: 1.20,
        startDate: '2021-11-22 20:00:00',
        endDate: '2021-11-23 22:00:00',
      },
      {
        groupId: 4,
        venueId: 5,
        name: 'Presidential Inauguration',
        description: 'See the president bark at dogs and play tennis while balancing the budget',
        type: 'In person',
        capacity: 500,
        price: 0,
        startDate: '2024-01-20 12:00:00',
        endDate: '2024-01-20 14:00:00',
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
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Tennis Group First Meet and Greet', 'Tennis Singles', 'Dog Park', 'Presidential Inauguration'] }
    }, {});
  }
};

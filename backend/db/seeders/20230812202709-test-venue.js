'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Venues';

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
        address: '111 S. Figueroa St.',
        city: 'Los Angeles',
        state: 'CA',
        lat: 34.04323086215862,
        lng: -118.26714681164798
      },
      {
        groupId: 1,
        address: '175 5th Ave.',
        city: 'New York',
        state: 'NY',
        lat: 40.741198662256004,
        lng: -73.98963423038316
      },
      {
        groupId: 2,
        address: '44 Montgomery St.',
        city: 'San Francisco',
        state: 'CA',
        lat: 37.78975651746192,
        lng: -122.40190579372981
      },
      {
        groupId: 3,
        address: '123 Disney Lane',
        city: 'New York',
        state: 'NY',
        lat: 37.7645358,
        lng: -122.4730327
      },
      {
        groupId: 4,
        address: '1600 Pennsylvania Avenue',
        city: 'Washington',
        state: 'DC',
        lat: 38.897957,
        lng: -38.897957
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
      address: { [Op.in]: ['111 S. Figueroa St.', '175 5th Ave.', '44 Montgomery St.', '123 Disney Lane', '1600 Pennsylvania Avenue'] }
    }, {});
  }
};

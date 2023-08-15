'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Groups';

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
        organizerId: 1,
        name: 'Evening Tennis on the Water',
        about: 'Enjoy rounds of tennis with a tight-knit group of people on the water facing the Brooklyn Bridge.',
        type: 'In person',
        private: true,
        city: 'New York',
        state: 'NY'
      },
      {
        organizerId: 1,
        name: 'Dog Lovers',
        about: 'For people who love dogs and who are in turn loved by dogs',
        type: 'In person',
        private: false,
        city: 'Los Angeles',
        state: 'CA'
      },
      {
        organizerId: 2,
        name: 'Cat Lovers',
        about: 'For people who love cats and who are in turn tolerated by cats',
        type: 'In person',
        private: false,
        city: 'Los Angeles',
        state: 'CA'
      },
      {
        organizerId: 3,
        name: 'Remote singles',
        about: 'People seeking others',
        type: 'Online',
        private: true,
        city: 'San Francisco',
        state: 'CA'
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
      name: { [Op.in]: ['Evening Tennis on the Water', 'Tennis Singles', 'Dog Lovers', 'Cat Lovers', 'Remote singles'] }
    }, {});
  }
};

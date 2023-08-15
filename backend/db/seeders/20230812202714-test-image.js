'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Images';

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
        url: 'https://www.example.com/url1.jpg',
        preview: true,
        imageableId: 1,
        imageableType: 'Group',
      },
      {
        url: 'https://www.example.com/url2.jpg',
        preview: true,
        imageableId: 1,
        imageableType: 'Event',
      },
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
      url: { [Op.in]: ['https://www.example.com/url1.jpg', 'https://www.example.com/url2.jpg'] }
    }, {});
  }
};

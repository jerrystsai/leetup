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
        url: 'https://picsum.photos/id/101/200',
        preview: true,
        imageableId: 1,
        imageableType: 'Group',
      },
      {
        url: 'https://picsum.photos/id/102/200',
        preview: false,
        imageableId: 1,
        imageableType: 'Group',
      },
      {
        url: 'https://picsum.photos/id/103/200',
        preview: true,
        imageableId: 1,
        imageableType: 'Event',
      },
      {
        url: 'https://picsum.photos/id/104/200',
        preview: false,
        imageableId: 1,
        imageableType: 'Event',
      },
      {
        url: 'https://picsum.photos/id/121/200',
        preview: true,
        imageableId: 2,
        imageableType: 'Event',
      },
      {
        url: 'https://picsum.photos/id/108/200',
        preview: true,
        imageableId: 2,
        imageableType: 'Group',
      },
      {
        url: 'https://picsum.photos/id/106/200',
        preview: true,
        imageableId: 3,
        imageableType: 'Group',
      },
      {
        url: 'https://picsum.photos/id/107/200',
        preview: true,
        imageableId: 4,
        imageableType: 'Group',
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
      url: { [Op.in]: ['https://picsum.photos/id/101/200', 'https://picsum.photos/id/102/200',
                       'https://picsum.photos/id/103/200', 'https://picsum.photos/id/104/200'] }
    }, {});
  }
};

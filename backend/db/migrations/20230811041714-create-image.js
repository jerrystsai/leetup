'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        isUrl: true
      },
      preview: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      imageableId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      imageableType: {
        type: Sequelize.ENUM('Event', 'Group'),
        allowNull: false,
        validate: {
          isIn: [['Event', 'Group']]
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Images';
    await queryInterface.dropTable(options);
  }
};

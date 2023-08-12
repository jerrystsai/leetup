'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Groups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      organizerId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(60),
        validate: {
          len: [1,60]
        },
        allowNull: false,
        unique: true
      },
      about: {
        type: Sequelize.STRING(256),
        validate: {
          len: [50,256]
        },
      },
      type: {
        type: Sequelize.ENUM('Online', 'In person'),
        allowNull: false,
        validate: {
          isIn: [['Online', 'In person']]
        }
      },
      private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      city: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(30),
        allowNull: false
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
    options.tableName = 'Groups';
    await queryInterface.dropTable(options);
  }
};

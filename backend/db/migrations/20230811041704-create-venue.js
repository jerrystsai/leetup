'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Venues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING(256),
        allowNull: false
      },
      city: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      lat: {
        type: Sequelize.DECIMAL,
        validate: {
          isDecimal: {
            msg: "Latitude is not valid"
          },
          min: -90,
          max: 90
        }
      },
      long: {
        type: Sequelize.DECIMAL,
        validate: {
          isDecimal: {
            msg: "Latitude is not valid"
          },
          min: -180,
          max: 180
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
    options.tableName = 'Venues';
    await queryInterface.dropTable(options);
  }
};

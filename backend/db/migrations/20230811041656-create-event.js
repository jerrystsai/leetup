'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      venueId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(256),
        validate: {
          len: [5,256]
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Online', 'In Person'),
        validate: {
          isIn: [['Online', 'In Person']]
        }
      },
      capacity: {
        type: Sequelize.INTEGER,
        validate: {
          isInt: {
            msg: "Capacity must be an integer"
          }
        }
      },
      price: {
        type: Sequelize.DECIMAL,
        validate: {
          isDecimal: {
            msg: "Price is invalid"
          }
        }
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          startDateAfterNow(value) {
            const now = new Date();
            if (value < now) {
              throw new Error("Start date must be in the future")
            }
          }
        }
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          endDateAfterStartDate(value) {
            if (value < this.startDate) {
              throw new Error("End date is less than start date")
            }
          }
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
    options.tableName = 'Events';
    await queryInterface.dropTable(options);
  }
};

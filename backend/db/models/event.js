'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsToMany(models.User, {
        through: models.EventAttendee,
        foreignkey: 'eventId',
        otherKey: 'userId'
      });
      Event.hasMany(models.Image, {
        foreignKey: 'imageableId',
        constraints: false,
        scope: {
          imageableType: 'Event'
        }
      });
    }
  }
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    venueId: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING(255),
      validate: {
        len: [5,255]
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Online', 'In Person'),
      allowNull: false,
      validate: {
        isIn: [['Online', 'In Person']]
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: {
          msg: "Capacity must be an integer"
        },
        min: 1,
      }
    },
    price: {
      type: DataTypes.DECIMAL,
      validate: {
        isDecimal: {
          msg: "Price is invalid"
        },
        min: 0,
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        startDateAfterNow(value) {
          const now = new Date();
          if (value < now) {
            throw new Error("Start date must be in the future");
          }
        }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        endDateAfterStartDate(value) {
          if (value < this.startdate) {
            throw new Error("End date is less than start date");
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};

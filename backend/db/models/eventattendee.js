'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EventAttendee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EventAttendee.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('attending', 'waitlist', 'pending'),
      allowNull: false,
      validate: {
        isIn: [['attending', 'waitlist', 'pending']]
      }
    }
  }, {
    sequelize,
    modelName: 'EventAttendee',
    defaultScope: {
      attributes: {
        exclude: ["id", "eventId", "userId", "createdAt", "updatedAt"]
      }
    }
  });
  return EventAttendee;
};

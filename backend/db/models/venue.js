'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Venue.belongsToMany(models.Group, {
        through: models.GroupVenue,
        foreignkey: 'venueId',
        otherKey: 'groupId'
      });
      Venue.belongsToMany(models.Group, {
        through: models.Event,
        foreignkey: 'venueId',
        otherKey: 'groupId'
      });
    }
  }
  Venue.init({
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    lat: {
      type: DataTypes.DECIMAL,
      validate: {
        isDecimal: {
          msg: "Latitude is not valid"
        },
        min: -90,
        max: 90
      }
    },
    long: {
      type: DataTypes.DECIMAL,
      validate: {
        isDecimal: {
          msg: "Latitude is not valid"
        },
        min: -180,
        max: 180
      }
    }
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};

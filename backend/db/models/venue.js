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
      Venue.belongsTo(models.Group, {
        foreignKey: 'groupId',
      });
      Venue.hasMany(models.Event, {
        foreignKey: 'venueId',
        onDelete: 'cascade',
      });
    }
  }
  Venue.init({
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        len: [2,2],
        isUppercase: true
      }
    },
    lat: {
      type: DataTypes.FLOAT,
      validate: {
        isDecimal: {
          msg: "Latitude is not valid"
        },
        min: -90,
        max: 90
      }
    },
    lng: {
      type: DataTypes.FLOAT,
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
    defaultScope: {
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    }
  });
  return Venue;
};

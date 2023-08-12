'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.belongsTo(models.User, {
        foreignKey: 'organizerId'
      });
      Group.belongsToMany(models.User, {
        through: models.GroupMember,
        foreignkey: 'groupId',
        otherKey: 'userId'
      });
      Group.belongsToMany(models.Venue, {
        through: models.GroupVenue,
        foreignkey: 'groupId',
        otherKey: 'venueId'
      });
      Group.belongsToMany(models.Venue, {
        through: models.Event,
        foreignkey: 'groupId',
        otherKey: 'venueId'
      });
      Group.hasMany(models.Image, {
        foreignKey: 'imageableId',
        constraints: false,
        scope: {
          imageableType: 'Group'
        }
      });
    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: [1,60]
      },
    },
    about: {
      type: DataTypes.STRING(255),
      validate: {
        len: [50,255]
      },
    },
    type: {
      type: DataTypes.ENUM('Online', 'In person'),
      allowNull: false,
      validate: {
        isIn: [['Online', 'In person']]
      }
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};

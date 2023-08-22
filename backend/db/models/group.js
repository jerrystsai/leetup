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
        foreignKey: 'organizerId',
        key: 'id',
        as: 'Organizers'
      });
      Group.belongsToMany(models.User, {
        through: models.GroupMember,
        foreignKey: 'groupId',
        otherKey: 'userId',
        as: 'Members'
      });
      Group.hasMany(models.Event, {
        foreignKey: 'groupId',
        onDelete: 'cascade'
      });
      Group.hasMany(models.Venue, {
        foreignKey: { name: 'groupId' },
        onDelete: 'cascade'
      });
      Group.hasMany(models.Image, {
        foreignKey: 'imageableId',
        constraints: false,
        scope: {
          imageableType: 'Group'
        },
        onDelete: 'cascade',
        as: 'GroupImages'
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
      unique: true,
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
      allowNull: false,
      validate: {
        len: [1,50]
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
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};

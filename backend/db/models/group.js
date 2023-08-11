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
    organizerId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    about: DataTypes.STRING,
    type: DataTypes.ENUM('Online', 'In person'),
    private: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};

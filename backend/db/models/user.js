'use strict';
const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    toSafe() {
      return {
        id: this.id,
        username: this.username,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
      }
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Group, {
        foreignkey: 'organizerId',
        // onDelete: 'CASCADE', hooks: true
      });
      User.belongsToMany(models.Group, {
        through: models.GroupMember,
        foreignkey: 'userId',
        otherKey: 'groupId'
      });
      User.belongsToMany(models.Event, {
        through: models.EventAttendee,
        foreignkey: 'userId',
        otherKey: 'eventId'
      });
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [4, 30],
        isNotEmail(val) {
          if (Validator.isEmail(val)) {
            throw new Error('Username must not be an email address.');
          }
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 30]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 256],
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    },
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
      }
    }
  });
  return User;
};

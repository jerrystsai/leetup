'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsTo(models.Event, {
        foreignKey: 'imageableId',
        constraints: false,
      });
      Image.belongsTo(models.Group, {
        foreignKey: 'imageableId',
        constraints: false,
      });
    }
  }
  Image.init({
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: {
          msg: "Url must be a valid url"
        }
      }
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    imageableId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    imageableType: {
      type: DataTypes.ENUM('Event', 'Group'),
      allowNull: false,
      validate: {
        isIn: [['Event', 'Group']]
      }
    }
  }, {
    sequelize,
    modelName: 'Image',
    defaultScope: {
      attributes: {
        exclude: ["imageableId", "imageableType", "createdAt", "updatedAt"]
      }
    }
  });
  return Image;
};

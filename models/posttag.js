'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PostTag.belongsTo(models.Post, { foreignKey: 'postId', onDelete: 'CASCADE' });
      PostTag.belongsTo(models.Tag, { foreignKey: 'tagId', onDelete: 'CASCADE' });
    }
  }
  PostTag.init({
    postId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'PostTag',
  });
  return PostTag;
};

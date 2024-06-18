'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
    }
  }
  Post.init({
    title: DataTypes.STRING,
    cover: DataTypes.STRING,
    data: DataTypes.TEXT,
    description: DataTypes.STRING,
    tags: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};
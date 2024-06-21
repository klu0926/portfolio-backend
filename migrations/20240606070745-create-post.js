'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      cover: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.STRING
      },
      tags: {
        type: Sequelize.STRING
      },
      backgroundHex: {
        type: Sequelize.STRING,
        defaultValue: '#FFFFFF'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  }
};
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const otherList = [
      'blender', 'maya', 'photoshop', 'premiere',
      'unity', 'unreal', 'spine', 'wordpress'
    ]

    const codingList = [
      'aws', 'bootstrap', 'csharp', 'handlebar', 'javascript', 'mongodb', 'mySQL', 'node',
      'react', 'vite',
    ]

    const tagList = [...otherList, ...codingList]
    const tags = tagList.map(tag => {
      return {
        name: tag,
        icon: `/images/tags/${tag}.png`,
      }
    })
    return queryInterface.bulkInsert('Tags', tags)
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Tags', null, {})
  }
};

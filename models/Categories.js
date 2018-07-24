module.exports = function(Sequelize,app) {
  return {
    tablename:"categories",
    schema:{
      "name":{
        type: Sequelize.STRING
      },
      "description":{
        type: Sequelize.TEXT,
        allowNull: true
      }
    },
    options:{
    }
  }
}
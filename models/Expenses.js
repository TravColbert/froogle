module.exports = function(Sequelize,app) {
  return {
    tablename:"expenses",
    schema:{
      "date":{
        type: Sequelize.DATE, 
        defaultValue: Sequelize.NOW
      },
      "amount":{
        type: Sequelize.DECIMAL
      },
      "provider":{
        type: Sequelize.STRING,
        allowNull: true
      },
      "note":{
        type: Sequelize.STRING,
        allowNull: true
      },
      "public":{
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    },
    options:{
    }
  }
}
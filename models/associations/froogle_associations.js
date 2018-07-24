module.exports = function(app) {
  (function() {
    let myName = "froogle expenses";
    app.log("Invoking association",myName,6);
    app.models["expenses"].belongsTo(app.models["categories"],{as:"category"});  // makes expenses.categoryId -> categories.id
    app.models["expenses"].belongsTo(app.models["users"]);                         // makes expenses.userId
    app.models["expenses"].belongsTo(app.models["domains"]);                       // makes expenses.domainId
    app.models["categories"].belongsTo(app.models["domains"]);                     // makes categories.domainId
    // app.models["expenses"].hasOne(app.models["users"],{as:"user"});             // makes expenses.userId
    // app.models["parts"].belongsToMany(app.models["cars"],{through:"PartCar"});  // makes new model 'PartCar' connecting the two
  })(app);
}


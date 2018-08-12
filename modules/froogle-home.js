module.exports = function(app) {
  let obj = {
    home : function(req,res,next) {
      let myName = "froogle-home";
      app.log("In custom home module",myName,6);

      // If there is no user let's move on...
      if(!req.session.user) {
        app.log("No user session appears to exist. Moving on...",myName,6);
        return true;
      }

      return new Promise((resolve,reject) => {
        app.log("A user session appears to be available",myName,6);

        // Is there a default domain set for the user?
        if(req.session.user.currentDomain!==null) {
          // Collect all the expenses for this domain:
          app.log("Collecting recent expenses",myName,6);
          // app.controllers["expenses"].getByDomainId(req.session.user.id,req.session.user.currentDomain)
          app.controllers["expenses"].getByDomainId(req.session.user.currentDomain.id)
          .then(expenses => {
            req.appData.expenses = expenses;
            resolve(true);
          })
          .catch(err => {
            app.log("Error: " + err.message,myName,6);
            reject(err);
          })
        }
      })
    }
  }
  return obj;
}
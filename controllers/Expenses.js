module.exports = function(app,model) {
  if(!model) return false;
  let myName = model + "Controller";
  let myModel = model;
  obj = {
    __create : function(obj) {
      let myName = "__create";
      app.log("Creating obj: " + obj,myName,6);
      return app.controllers["default"].create(model,obj);
    },
    __get : function(obj) {
      let myName = "__get";
      app.log("Getting obj: " + obj,myName,6);
      return app.controllers["default"].get(model,obj);
    },
    __update : function(obj) {
      let myName = "__update";
      app.log("Updating obj: " + obj,myName,6);
      return app.controllers["default"].update(model,obj);
    },
    __delete : function(obj) {
      let myName = "__delete";
      app.log("Deleting obj: " + obj,myName,6);
      return app.controllers["default"].delete(model,obj);
    },

    getByUserAndDomainId : function(userId,domainId) {
      let myName = "getByUserAndDomainId";
      let searchObj = {
        where : {
          "userId" : userId,
          "domainId" : domainId
        }
      };
      app.log("Looking for expenses in: " + searchObj,myName,6);
      return app.controllers[model].__get(searchObj);
    },
    getByDomainId : function(domainId) {
      let myName = "getByDomainId";
      let searchObj = {
        where : {
          "domainId" : domainId
        }
      }
      app.log("Looking for expenses in domain: " + domainId,myName,6);
      return app.controllers[model].__get(searchObj);
    },

    gets : function(req,res,next) {
      let myName = "gets (expenses)";
      // let searchObj = {
      //   where : {
      //     "userId" : req.session.user.id,
      //     "domainId" : req.session.user.currentDomain.id  
      //   }
      // }
      app.tools.checkAuthorization(["list","all"],req.session.user.id,req.session.user.currentDomain.id)
      .then(response => {
        if(!response) {
          app.log("User failed authorization check",myName,6);
          return next();
        }
        app.log("User is authorized to list expenses",myName,6);
        return app.controllers[model].getByDomainId(req.session.user.currentDomain.id);
      })
      .then(expenses => {
        req.appData.expenses = expenses;
        req.appData.view = "expenses";
        return next();
      })
      .catch(err => {
        return res.send("Err: " + err.message);
      })
    },
    get : function(req,res,next) {
      let myName = "get (expenses)";
      let searchObj = {
        where : {
          "id" : req.params.id
        }
      }
      app.tools.checkAuthorization(["list","all"],req.session.user.id,req.session.user.currentDomain.id)
      .then(response => {
        if(!response) {
          app.log("User failed authorization check",myName,6);
          return next();
        }
        app.log("User is authorized to list expenses",myName,6);
        return app.controllers[model].__get(searchObj);
      })
      .then(expenses => {
        req.appData.expense = expenses[0];
        req.appData.view = "expense";
        return next();
      })
      .catch(err => {
        return res.send("Err: " + err.message);
      })      
    },
    editExpenseForm : function(req,res,next) {
      let myName = "editExpenseForm";
      let searchObj = {
        where : {
          "id" : req.params.id,
          "userId" : req.session.user.id
        }
      };
      app.controllers[model].__get(searchObj)
      .then(expenses => {
        if(!expenses) return res.redirect("/expenses/");
        app.log("Expense found: " + expenses[0],myName,6);
        req.appData.expense = expenses[0];
        req.appData.view = "expenseedit";
        return next();
      })
      .catch(err => {
        return res.send(myName + ":" + err.message);
      })
    },
    editExpense : function(req,res,next) {
      let myName = "editExpense";
      let expenseObj = app.tools.pullParams(req.body,["id","date","amount","provider","note","public"]);
      let requestedExpenseId = req.params.id;
      app.log(expenseObj.id + " " + requestedExpenseId);
      if(expenseObj.id!=requestedExpenseId) return res.send("Didn't request the requested expense");
      delete expenseObj.id;
      app.log("Updating expense: " + JSON.stringify(expenseObj),myName,6);
      app.controllers[model].__update({values:expenseObj,options:{where:{"id":requestedExpenseId}}})
      .then((expenses) => {
        app.log(expenses[0] + " expenses updated");
        return res.redirect("/expenses/" + requestedExpenseId + "/");
      })
      .catch(err => {
        app.log("Error: " + err.message,myName,4);
        return res.send(err.message);
      });
    },
    createExpense : function(req,res,next) {
      let myName = "createExpense";
      let newExpense = app.tools.pullParams(req.body,["date","amount","provider","note","public","userId","domainId"]);
      if(!newExpense) return res.send("Required field missing... try again");
      newExpense.userId = req.session.user.id;
      app.log("New expense: " + JSON.stringify(newExpense),myName,6,"::::>");
      app.controllers[model].__create(newExpense)
      .then(expense => {
        return res.redirect('/expenses/' + expense.id + "/");
      })
      .catch(err => {
        app.log("Error: " + err.message,myName,4);
        return res.send(err.message);
      });
    }
  };
  return obj;
};
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

    getByDomainId : function(domainId) {
      let myName = "getByDomainId";
      let searchObj = {
        where : {
          "domainId" : domainId
        }
      }
      app.log("Looking for categories in domain: " + domainId,myName,6);
      return app.controllers[model].__get(searchObj);
    },

    gets : function(req,res,next) {
      let myName = "gets (categories)";
      app.tools.checkAuthorization(["list","all"],req.session.user.id,req.session.user.currentDomain.id)
      .then(response => {
        if(!response) {
          app.log("User failed authorization check",myName,6);
          return next();
        }
        app.log("User is authorized to list categories",myName,6);
        return app.controllers[model].getByDomainId(req.session.user.currentDomain.id);
      })
      .then(categories => {
        req.appData.categories = categories;
        req.appData.view = "categories";
        return next();
      })
      .catch(err => {
        return res.send("Err: " + err.message);
      })
    },
    get : function(req,res,next) {
      let myName = "get (categories)";
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
      .then(categories => {
        req.appData.category = categories[0];
        req.appData.view = "category";
        return next();
      })
      .catch(err => {
        return res.send("Err: " + err.message);
      })
    },
    editCategoryForm : function(req,res,next) {
      let myName = "editCategoryForm";
      let searchObj = {
        where : {
          "id" : req.params.id,
          "domainId" : req.session.user.currentDomain.id
        }
      };
      app.controllers[model].__get(searchObj)
      .then(categories => {
        if(!categories) return res.redirect("/categories/");
        app.log("Category found: " + categories[0],myName,6);
        req.appData.category = categories[0];
        req.appData.view = "categoryedit";
        return next();
      })
      .catch(err => {
        return res.send(myName + ":" + err.message);
      })
    },
    editCategory : function(req,res,next) {
      let myName = "editCategory";
      let categoryObj = app.tools.pullParams(req.body,["id","name","description"]);
      let requestedCategoryId = req.params.id;
      app.log(categoryObj.id + " " + requestedCategoryId);
      if(categoryObj.id!=requestedCategoryId) return res.send("Didn't request the requested category");
      delete categoryObj.id;
      app.log("Updating category: " + JSON.stringify(categoryObj),myName,6);
      app.controllers[model].__update({values:categoryObj,options:{where:{"id":requestedCategoryId}}})
      .then((categories) => {
        app.log(categories[0] + " categories updated");
        return res.redirect("/categories/" + requestedCategoryId + "/");
      })
      .catch(err => {
        app.log("Error: " + err.message,myName,4);
        return res.send(err.message);
      });
    },
    createCategory : function(req,res,next) {
      let myName = "createCategory";
      let newCategory = app.tools.pullParams(req.body,["name","description"]);
      if(!newCategory) return res.send("Required field missing... try again");
      newCategory.domainId = req.session.user.currentDomain.id;
      app.log("New category: " + JSON.stringify(newCategory),myName,6,"::::>");
      app.controllers[model].__create(newCategory)
      .then(category => {
        return res.redirect('/categories/' + category.id + "/");
      })
      .catch(err => {
        app.log("Error: " + err.message,myName,4);
        return res.send(err.message);
      });
    }
  };
  return obj;
};
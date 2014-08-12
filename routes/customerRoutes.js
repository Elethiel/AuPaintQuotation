var customer = require("../model/customerObj");
var company = require("../model/companyObj");
var person = require("../model/personObj");
var util = require("util");
var lodash = require("lodash");

module.exports = function(app) {
    app.get("/customer", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config customer page (customer Form)

        // error from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            delete req.session.pstatus;
        }
        if (!req.param.subloc)  req.param.subloc = "customer";
        req.param.Obj = null;
        customer.findById(req.db, { customerId: req.query.customerId }, next, function(customerObj) {
            req.param.Obj = customer.getFlatVersion(customerObj);
            //console.log("param = " + util.inspect(req.param, false, null));
            if (req.session.oldObj) {
                lodash.assign(req.param.Obj, req.session.oldObj);
                delete req.session.oldObj;
            }
            req.param.loc = "customer";
            res.render("customer", {srv:  req.param} );
        });
        // ---------------------------------------------------------------------------------------------
    }).post("/customerUpdate", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit customer (process)
        customer.insertUpdate(req.db, req.body, next, function(ret) {
            req.session.pstatus = ret.msg === "ok" ? (req.body.customerId ? "upd-CUS" : "new-CUS") : ret.msg;
            var id = req.body.customerId ? req.body.customerId : ret.customerId
            if (ret.msg !== "ok") {
                req.session.oldObj = req.body;
            }
            res.redirect("/customer" + (id ? "?customerId=" + id : ""));
        });

        // ---------------------------------------------------------------------------------------------
    }).get("/customerDel", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }

        customer.delById(req.db, { customerId: req.query.customerId }, next, function(ret) {
            req.session.pstatus = ret.msg === "ok" ? "del-CUS" : ret.msg + "-CUS";
            req.session.pstatusvar = ret.customerNb ? ret.customerNb : 0;
            res.redirect("/customerMenu");
        });
        // ---------------------------------------------------------------------------------------------
    });
};

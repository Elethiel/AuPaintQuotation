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
        if (req.query.sub) {
            req.param.subloc = req.query.sub;
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
            res.redirect("/customer?" + (id ? "customerId=" + id + "&" : "") + "sub=main");
        });

        // ---------------------------------------------------------------------------------------------
    }).post("/customerUpdateContact", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit contact (process)
        person.insertUpdate(req.db, {
            personId: req.body.ctcPersonId,
            personGender: req.body.ctcPersonGender,
            personFirstname: req.body.ctcPersonFirstname,
            personLastname: req.body.ctcPersonLastname,
            personContactFace: req.body.ctcPersonContactFax,
            personContactMail: req.body.ctcPersonContactMail,
            personContactMobile: req.body.ctcPersonContactMobile,
            personContactTel: req.body.ctcPersonContactTel
            }, next, function (ret) {
                if (ret.msg === "ok" && !req.body.ctcPersonId && req.body.customerId) {
                    // need to link person and customer
                    person.linkToCustomer(req.db, { personId: ret.personId, customerId: req.body.customerId }, next, function() {} );
                }
                req.session.pstatus = ret.msg === "ok" ? (req.body.ctcPersonId ? "upd-CON" : "new-CON") : ret.msg;
                var id = req.body.customerId ? req.body.customerId : ret.customerId
                if (ret.msg !== "ok") {
                    req.session.oldObj = req.body;
                }
                res.redirect("/customer?" + (id ? "customerId=" + id + "&" : "") + "sub=contact");
        });
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

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
        if (req.query.sub) req.param.subloc = req.query.sub;

        if (!req.param.subloc)  req.param.subloc = "customer";

        req.param.Obj = null;
        customer.findById(req.db, { customerId: req.query.customerId }, function(err, customerObj) {
            if (err) next(err);
            else {
                req.param.Obj = customer.getFlatVersion(customerObj);
                //console.log("param = " + util.inspect(req.param, false, null));
                // get back new input from user before error
                if (req.session.oldObj) {
                    lodash.assign(req.param.Obj, req.session.oldObj);
                    delete req.session.oldObj;
                }
                req.param.loc = "customer";
                res.render("customer", {srv:  req.param} );
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).post("/customerUpdate", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit customer (process)
        customer.insertUpdate(req.db, req.body, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? (req.body.customerId ? "upd-CUS" : "new-CUS") : ret.msg;
                var id = req.body.customerId ? req.body.customerId : ret.customerId
                if (ret.msg !== "ok") req.session.oldObj = req.body;
                res.redirect("/customer?" + (id ? "customerId=" + id + "&" : "") + "sub=customer");
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).post("/customerUpdateContact", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit contact (process)
        person.insertUpdate(req.db, {
            notstring: req.body.notstring,
            personId: req.body.ctcPersonId,
            personGender: req.body.ctcPersonGender,
            personFirstname: req.body.ctcPersonFirstname,
            personLastname: req.body.ctcPersonLastname,
            personAddressId: req.body.ctcPersonAddressId,
            personContactId: req.body.ctcPersonContactId,
            personContactFax: req.body.ctcPersonContactFax,
            personContactMail: req.body.ctcPersonContactMail,
            personContactMobile: req.body.ctcPersonContactMobile,
            personContactTel: req.body.ctcPersonContactTel
            }, function (err, ret) {
                if (err) next(err);
                else {
                    if (ret.msg === "ok" && !req.body.ctcPersonId && req.body.customerId) {
                        // need to link person and customer
                        person.linkToCustomer(req.db, { personId: ret.personId, customerId: req.body.customerId }, function(err) { if (err) next(err); } );
                    }
                    req.session.pstatus = ret.msg === "ok" ? (req.body.ctcPersonId ? "upd-CON" : "new-CON") : ret.msg;
                    var id = req.body.customerId ? req.body.customerId : ret.customerId
                    if (ret.msg !== "ok") req.session.oldObj = req.body;
                    res.redirect("/customer?" + (id ? "customerId=" + id + "&" : "") + "sub=contact");
                }
            }
        );
    }).get("/customerDel", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }

        customer.delById(req.db, { customerId: req.query.customerId }, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? "del-CUS" : ret.msg + "-CUS";
                req.session.pstatusvar = ret.customerNb ? ret.customerNb : 0;
                res.redirect("/customerMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/customerDelPerson", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }
        person.delByCustomerIdAndId(req.db, { personId: req.query.personId, customerId: req.query.customerId }, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? "del-CON" : ret.msg + "-CON";
                req.session.pstatusvar = ret.customerNb ? ret.customerNb : 0;
                res.redirect("/customer?" + (req.query.customerId ? "customerId=" + req.query.customerId + "&" : "") + "sub=contact");
            }
        });
        // ---------------------------------------------------------------------------------------------
    });;
};

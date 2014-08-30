var customer = require("../model/customerObj");
var util = require("util");
var lodash = require("lodash");

module.exports = function(app) {
    app.get("/quotation", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config quotation page (quotation Form)
        req.param.customerList = []; // for existing customer list
        req.param.loc = "quotation";
        if (!req.param.subloc)  req.param.subloc = "customer";

        customer.findAll(req.db, function(err, customerList) {
            if (err) next(err);
            else {
                if (customerList) req.param.customerList = customerList;
                req.param.type = req.query.type;
                res.render("quotation", {srv:  req.param} );
            }
        });
        // ---------------------------------------------------------------------------------------------
    });
};

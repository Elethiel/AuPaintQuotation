var product = require("../model/productObj");
var customer = require("../model/customerObj");
var util = require("util");

module.exports = function(app) {
    app.get("/", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // home page (welcome)
        if (req.param.session.username) req.param.loc = "home";      // logged
        else req.param.loc = "";                            // no more session
        res.render("welcome", {srv:  req.param});
        // ---------------------------------------------------------------------------------------------
    }).get("/productMenu", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // manage Product
        req.param.productList = [];
        // success from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }
        product.findAll(req.db, next, function(productList) {
            if (productList) {
                req.param.productList = productList;
            }
            
            req.param.loc = "product";
            res.render("productMenu", {srv:  req.param});
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/customerMenu", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // manage Customer
        req.param.customerList = [];
        // success from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }
        customer.findAll(req.db, next, function(customerList) {
            if (customerList) {
                req.param.customerList = customerList;
            }
            
            req.param.loc = "customer";
            res.render("customerMenu", {srv:  req.param});
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/quotationMenu", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // manage Quotation and Invoices
        req.param.loc = "quotation";
        res.render("welcome", {srv:  req.param});
        // ---------------------------------------------------------------------------------------------
    });
};

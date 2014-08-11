var product = require("../model/productObj");
var groupProduct = require("../model/groupProductObj");
var util = require("util");
var lodash = require("lodash");

module.exports = function(app) {
    app.get("/product", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config product page (product Form)

        // error from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            delete req.session.pstatus;
        }
        req.param.groupProductList = [];
        req.param.Obj = null;
        product.findById(req.db, { productId: req.query.productId }, next, function(productObj) {
            req.param.Obj = product.getFlatVersion(productObj);
            //console.log("param = " + util.inspect(req.param, false, null));
            // get all groupProduct for Select box
            groupProduct.findAll(req.db, next, function (groupProductList) {
                if (groupProductList) {
                    req.param.groupProductList = groupProductList;
                }
                if (req.session.oldObj) {
                    lodash.assign(req.param.Obj, req.session.oldObj);
                    delete req.session.oldObj;
                }
                req.param.loc = "product";
                res.render("product", {srv:  req.param} );
            });
        });
        // ---------------------------------------------------------------------------------------------
    }).post("/productUpdate", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit product (process)
        product.insertUpdate(req.db, req.body, next, function(ret) {
            req.session.pstatus = ret.msg === "ok" ? (req.body.productId ? "upd-PRD" : "new-PRD") : ret.msg;
            if (ret.msg !== "ok") {
                req.session.oldObj = req.body;
            }
            if (ret.msg === "nok") res.redirect("/product" + (req.body.productId ? "?productId=" + req.body.productId : ""));
            else res.redirect("/productMenu");
        });
        
        // ---------------------------------------------------------------------------------------------
    }).get("/productDel", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }

        product.delById(req.db, { productId: req.query.productId }, next, function(ret) {
            req.session.pstatus = ret.msg === "ok" ? "del-PRD" : ret.msg + "-PRD";
            req.session.pstatusvar = ret.productNb ? ret.productNb : 0;
            res.redirect("/productMenu");
        });
        // ---------------------------------------------------------------------------------------------
    });
};

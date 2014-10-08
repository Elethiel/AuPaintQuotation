var customer = require("../model/customerObj");
var product = require("../model/productObj");
var groupProduct = require("../model/groupProductObj");
var paycond = require("../model/payCondObj");
var paytype = require("../model/payTypeObj");
var owner = require("../model/ownerObj");
var quotation = require("../model/quotationObj");
var util = require("util");
var lodash = require("lodash");

var calculationQuotation = function (req, quoObj) {
    // is the quotation an Invoice, which is already started ?
    // should we blocked it ? (not be able to change customer, product...)
    quoObj.isAlreadyStarted = false;
    if (quoObj.quotationType == 1) { // it's an invoice
        if (quoObj.quotationDeposite > 0 || quoObj.quotationPaymentList.length > 0) { // at least a deposite or a payment
            quoObj.isAlreadyStarted = true;
        }
    }
    if (!quoObj.quotationId && req.session.ownerObj.ownerDefaultValidity && req.session.ownerObj.ownerDefaultValidity > 0) {
        quoObj.quotationEndValidityDt = new Date(quoObj.quotationCreationDt);
        quoObj.quotationEndValidityDt.setDate(quoObj.quotationCreationDt.getDate() + req.session.ownerObj.ownerDefaultValidity);
    }
    return quoObj;
};

module.exports = function(app) {
    app.get("/quotation", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config quotation page (quotation Form)
        req.param.customerList = []; // for existing customer list
        req.param.productList = []; // for product list (presta)
        req.param.payCondList = []; // for payment conditions list (payment)
        req.param.payTypeList = []; // for payment type list (payment)
        req.param.groupProductList = []; // for new presta

        req.param.loc = "quotation";
        if (!req.param.subloc)  req.param.subloc = "customer";

        customer.findAll(req.db, function(err, customerList) {
            if (err) next(err);
            else {
                if (customerList) req.param.customerList = customerList;
                product.findAll(req.db, function(err, productList) {
                    if (err) next(err);
                    else {
                        if (productList) req.param.productList = productList;
                        paycond.findAll(req.db, function(err, payCondList) {
                            if (err) next(err);
                            else {
                                if (payCondList) req.param.payCondList = payCondList;
                                paytype.findAll(req.db, function(err, payTypeList) {
                                    if (err) next(err);
                                    else {
                                        if (payTypeList) req.param.payTypeList = payTypeList;

                                        // pattern
                                        owner.getCalculatedPattern( req.db, req.param.session.ownerObj.ownerPattern,
                                            function(err, pattern) {
                                                if (err) next(err);
                                                else {
                                                    groupProduct.findAll(req.db, function (err, groupProductList) {
                                                        if (err) next(err);
                                                        else {
                                                            if (groupProductList) req.param.groupProductList = groupProductList;

                                                            if (req.query.quotationId && req.query.quotationId > 0) {
                                                                quotation.findById( req.db, { quotationId: req.query.quotationId },
                                                                    function(err, quotationObj) {
                                                                        if (err) next(err);
                                                                        else {
                                                                            req.param.Obj = calculationQuotation(req, quotationObj);
                                                                            req.param.type = req.param.Obj.quotationType;
                                                                            res.render("quotation", {srv:  req.param} );
                                                                        }
                                                                    }
                                                                );
                                                            } else {
                                                                req.param.Obj = calculationQuotation(req, { quotationId: null, quotationType: req.query.type, customerObj: null, quotationRef: pattern, quotationVersion: 1, quotationCreationDt: new Date(), quotationUpdateDt: null, quotationEndValidatyDt: "", quotationInvoiceStatus: "", quotationGlobalDiscount: 0, quotationDeposite: 0, quotationInternalNote: "", quotationCustomerNote: "", payCondObj: null, quotationPaymentList: [], quotationPayTypeList: [], quotationPrestaList: [], quotationParentId: null, quotationDocList: [], isAlreadyStarted: false });
                                                                req.param.type = req.query.type;
                                                                res.render("quotation", {srv:  req.param} );
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).post("/quotationUpdate", function(req, res, next) {
        //
        // submit quotation (process)
        quotation.insertUpdate(req.db, req.body, function(err, ret) {
            if (err) next(err);
            else {
                res.render("quotationUpdate", {srv: (ret.msg === "ok"), id: null });
            }
        });

    }).post("/quotationUnicity", function(req, res, next) {
        //
        // check quotation ref unicity
        quotation.checkUnicity(req.db, req.body, function(err, ret) {
            if (err) next(err);
            else {
                res.render("quotationUpdate", {srv: (ret.msg === "ok"), id: null });
            }
        });

    }).get("/quotationDel", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }

        quotation.delById(req.db, { quotationId: req.query.quotationId }, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? "del-QUO" : ret.msg + "-QUO";
                res.redirect("/quotationMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    });
};

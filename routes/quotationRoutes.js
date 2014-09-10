var customer = require("../model/customerObj");
var product = require("../model/productObj");
var util = require("util");
var lodash = require("lodash");

module.exports = function(app) {
    app.get("/quotation", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config quotation page (quotation Form)
        req.param.customerList = []; // for existing customer list
        req.param.productList = []; // for product list (presta)
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
                        req.param.quotationObj = { quotationId: null, quotationType: req.query.type, customerObj: null, quotationRef: "", quotationVersion: 1, quotationCreationDt: "", quotationUpdateDt: "", quotationEndValidatyDt: "", quotationInvoiceStatus: "", quotationGlobalDiscount: 0, quotationDeposite: 0, quotationInternalNote: "", quotationCustomerNote: "", payCondObj: null, quotationPayTypeList: {}, quotationPrestaList: {}, quotationParentId: null, quotationDocList: {} };
                        req.param.type = req.query.type;
                        res.render("quotation", {srv:  req.param} );
                    }
                });
            }
        });
        // ---------------------------------------------------------------------------------------------
    });
};

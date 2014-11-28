var doc = require("../model/docObj");
var quotation = require("../model/quotationObj");
var util = require("util");
var lodash = require("lodash");

module.exports = function(app) {
    app.post("/docGenerate", function(req, res, next) {
        //
        // check if it's possible to generate
        console.log("Document Generation Start : " + req.body.generateDocFor);
        if (req.body && req.body.generateDocFor && req.body.generateDocFor > 0) {
            quotation.findById(req.db, {quotationId : req.body.generateDocFor }, function(err, quotationObj) {
                req.session.ownerObj.username = req.session.username;
                doc.generateDoc(req.db, {quotationId: req.body.generateDocFor, quotationObj: quotationObj, ownerObj: req.session.ownerObj }, function(err, generatedDoc) {
                    if (err) next(err);
                    else {
                        res.contentType("json");
                        res.send({ generatedDoc: JSON.stringify(generatedDoc) });
                        console.log("Document Generation END");
                    }
                });
            });
        } else {
            res.contentType("json");
            res.send({ generatedDoc: null });
            console.log("Document Generation ERROR");
        }
    });
};

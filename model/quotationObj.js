var customer = require("../model/customerObj");
var payment = require("../model/paymentObj");
var presta = require("../model/prestaObj");
var paycond = require("../model/payCondObj");
var paytype = require("../model/payTypeObj");
var doc = require("../model/docObj");
var tools = require("../model/_tools");
var util = require("util");
var lodash = require("lodash");
var async = require("async");


// db.run("CREATE TABLE invoice (id INTEGER PRIMARY KEY AUTOINCREMENT, type BOOLEAN, customer_id INT, ref TEXT, version INT, creationDt DATE, updateDt DATE, endValidityDt DATE, invoiceStatus TEXT,  globalDiscount REAL, deposite REAL, internalNote TEXT, customerNote TEXT, payCond_id INT, parent_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'invoice'); } });
// db.run("CREATE TABLE invoice_presta (invoice_id INT, presta_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'invoice_presta'); } });
// db.run("CREATE TABLE invoice_payment (invoice_id INT, payment_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'invoice_payment'); } });
// db.run("CREATE TABLE invoice_payType (invoice_id INT, payType_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'invoice_payType'); } });

var Quotation = function() {};

Quotation.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    var parentId = param.quotationId;

    if (param.quotationId && param.quotationId > 0) {
        // existing (update)
        // the existing will become the parent, and we will consider always the object as new
        param.quotationId = null;
        param.quotationVersion += 1;
    }
    // all save are new (in worst cases it will update the version
    // it will remains as "1" for a new

    // 1. manage customer if needed --------------------------------------------------------------------------
    if (param.quotationType == 1) param.customerObj.customerStatus = 1;
    customer.insertUpdate(db, customer.getFlatVersion(param.customerObj), function(err, ret) {
        if (err) callback(err);
        else {
            if (ret.msg != "ok") callback(err, ret);
            else {
                param.customerId = ret.customerId;
                // 2. object Invoice
                db.run("INSERT INTO invoice (type, customer_id, ref, version, creationDt, updateDt, endValidityDt, invoiceStatus,  globalDiscount, deposite, internalNote, customerNote, payCond_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [ param.quotationType, param.customerId, param.quotationRef, param.quotationVersion, new Date(param.quotationCreationDt),
                        new Date(), new Date(param.quotationEndValidityDt), param.quotationStatus,
                        param.quotationGlobalDiscount, param.quotationRealDeposite, param.quotationInternalNote, param.quotationCustomerNote,
                        param.payCondObj ? param.payCondObj.payCondId : null, param.quotationParentId ],
                    function(err, row) {
                        if (err) callback(err);
                        else {
                            if (this.lastID)    {
                                // 2a parent
                                db.run("UPDATE invoice SET parent_id = ? WHERE id = ?", [ this.lastID, parentId ], function(err, row) {} );

                                // 3. Link PayType to Invoice --------------------------------------------------------------------------
                                var seriesFns = [];
                                var self = this;
                                var o = 0;
                                if (param.quotationPayTypeList) {
                                    for(var i = 0; i < param.quotationPayTypeList.length; i++) {
                                        seriesFns.push(function(c) {
                                            db.run("INSERT INTO invoice_payType (invoice_id, payType_id) VALUES (?, ?)",
                                                [ self.lastID, param.quotationPayTypeList[o].payTypeId ],
                                                function(err, rows) {
                                                    o++;
                                                    c(err, row);
                                                }
                                            );
                                        });
                                    }
                                }
                                async.series( seriesFns,
                                    function(err, rows) {
                                        if (err) callback(err);
                                        else {
                                            // 4. Payment --------------------------------------------------------------------------
                                            seriesFns = [];
                                            o = 0;
                                            if (param.quotationPaymentList) {
                                                for(var i = 0; i < param.quotationPaymentList.length; i++) {
                                                    seriesFns.push( function(c) {
                                                        payment.insertUpdate(db, param.quotationPaymentList[o], function(err, obj) {
                                                            if (obj) param.quotationPaymentList[o].paymentId = obj.paymentId;
                                                            o++;
                                                            c(err, obj);
                                                        });
                                                    });
                                                }
                                            }
                                            async.series( seriesFns,
                                                function(err, rows) {
                                                    if (err) callback(err);
                                                    else {
                                                        // 5. Link Payment to Invoice --------------------------------------------------------------------------
                                                        seriesFns = [];
                                                        o = 0;
                                                        if (param.quotationPaymentList) {
                                                            for(var i = 0; i < param.quotationPaymentList.length; i++) {
                                                                seriesFns.push(function(c) {
                                                                    db.run("INSERT INTO invoice_payment (invoice_id, payment_id) VALUES (?, ?)",
                                                                        [ self.lastID, param.quotationPaymentList[o].paymentId ],
                                                                        function(err, rows) {
                                                                            o++;
                                                                            c(err, row);
                                                                        }
                                                                    );
                                                                });
                                                            }
                                                        }
                                                        async.series( seriesFns,
                                                            function(err, rows) {
                                                                if (err) callback(err);
                                                                else {
                                                                    // 6. Presta --------------------------------------------------------------------------
                                                                    seriesFns = [];
                                                                    o = 0;
                                                                    if (param.quotationPrestaList) {
                                                                        for(var i = 0; i < param.quotationPrestaList.length; i++) {
                                                                            param.quotationPrestaList[i].prestaOrd = i;
                                                                            seriesFns.push(function(c) {
                                                                                presta.insertUpdate(db, param.quotationPrestaList[o], function(err, obj) {
                                                                                    if (obj) param.quotationPrestaList[o].prestaId = obj.prestaId;
                                                                                    o++;
                                                                                    c(err, obj);
                                                                                });
                                                                            });
                                                                        }
                                                                    }
                                                                    async.series( seriesFns,
                                                                        function(err, rows) {
                                                                            if (err) callback(err);
                                                                            else {
                                                                                // 7. Link Presta to Invoice --------------------------------------------------------------------------
                                                                                seriesFns = [];
                                                                                o = 0;
                                                                                if (param.quotationPrestaList) {
                                                                                    for(var i = 0; i < param.quotationPrestaList.length; i++) {
                                                                                        seriesFns.push(function(c) {
                                                                                            db.run("INSERT INTO invoice_presta (invoice_id, presta_id) VALUES (?, ?)",
                                                                                                [ self.lastID, param.quotationPrestaList[o].prestaId ],
                                                                                                function(err, rows) {
                                                                                                    o++;
                                                                                                    c(err, row);
                                                                                                }
                                                                                            );
                                                                                        });
                                                                                    }
                                                                                }
                                                                                async.series( seriesFns,
                                                                                    function(err, rows) {
                                                                                        if (err) callback(err);
                                                                                        else {
                                                                                            // finish !
                                                                                            callback(null, {msg:"ok", quotationId : self.lastID});
                                                                                        }
                                                                                    }
                                                                                ); // link presta-invoice async
                                                                            }
                                                                        }
                                                                    ); // presta insert async
                                                                }
                                                            }
                                                        ); // link payment-invoice aync
                                                    }
                                                }
                                            ); // payment insert async
                                        }
                                    }
                                ); // link paytype-invoice async

                            } else                callback(null, {msg:"nok", quotationId: 0});
                        }
                    }
                ); // insert
            }
        }
    });
};

Quotation.prototype.findById = function(db, param, callback) {
    if (param.quotationId && param.quotationId > 0) {
        // console.log("** START find Quotation " + param.quotationId);
        var quotationObj = {};
        db.get("SELECT id, type, customer_id, ref, version, creationDt, updateDt, endValidityDt, invoiceStatus, globalDiscount, deposite, internalNote, customerNote, payCond_id, parent_id FROM  invoice WHERE id = ?", [ param.quotationId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row) {
                    // fill the PayCond object now
                    paycond.findById(db, { payCondId: row.payCond_id }, function(err, payCondObj) {
                        if (err) callback(err);
                        else {
                            // fill the customer object now
                            customer.findById(db, { customerId: row.customer_id }, function(err, customerObj) {
                                if (err) callback(err);
                                else {
                                    // find all presta related to this quotation
                                    presta.findAllByQuotationId(db, { quotationId: row.id }, function(err, prestaList) {
                                        if (err) callback(err);
                                        else {
                                            // find all payment related to this quotation
                                            payment.findAllByQuotationId(db, { quotationId: row.id }, function(err, paymentList) {
                                                if (err) callback(err);
                                                else {
                                                    // find all paytype related to this quotation
                                                    paytype.findAllByQuotationId(db, { quotationId: row.id }, function(err, payTypeList) {
                                                        if (err) callback(err);
                                                        else {
                                                            // find all doc related to this quotation
                                                            doc.findAllByQuotationId(db, { quotationId: row.id }, function(err, docList) {
                                                                if (err) callback(err);
                                                                else {
                                                                    // ok now build the quotationObj completely
                                                                    // before calculation
                                                                    var quotationObj = {};
                                                                    lodash.assign(quotationObj, { quotationId: row.id, quotationType: row.type, customerId: row.customer_id, quotationRef: row.ref, quotationVersion: row.version, quotationCreationDt: new Date(row.creationDt), quotationUpdateDt: new Date(row.updateDt), quotationEndValidityDt: new Date(row.endValidityDt), quotationStatus: row.invoiceStatus, quotationGlobalDiscount: row.globalDiscount, quotationRealDeposite: row.deposite, quotationInternalNote: row.internalNote, quotationCustomerNote: row.customerNote, quotationParentId: row.parent_id });
                                                                    quotationObj.customerObj = customerObj;
                                                                    quotationObj.payCondObj = payCondObj;
                                                                    quotationObj.quotationPrestaList = prestaList;
                                                                    quotationObj.quotationPaymentList = paymentList;
                                                                    quotationObj.quotationPayTypeList = payTypeList;
                                                                    quotationObj.quotationDocList = docList;

                                                                    //console.log("PT:\n" + util.inspect(payTypeList, false, null));

                                                                    callback(null, quotationObj);
                                                                }
                                                            }); // doc list
                                                        }
                                                    }); // paytype list
                                                }
                                            }); // payment list
                                        }
                                    }); // presta list
                                }
                            }); // find customer
                        }
                    }); // find payCond
                } else callback();
            }
        }); // find customer data
    } else callback();
};

Quotation.prototype.checkUnicity = function(db, param, callback) {
    if (param.quotationRef && param.quotationRef != "") {
        // console.log("** START check Quotation Unicity" + param.quotationRef);
        db.get("SELECT id FROM invoice WHERE ref = ?", [ param.quotationRef ], function(err, row) {
            if (err) callback(err);
            else {
                if (row) {
                    if (row.id && row.id > 0) callback(null, { msg: "nok" });
                    else callback(null, { msg: "ok" });
                } else callback(null, { msg: "ok" });
            }
        }); // find customer data
    } else callback(null, { msg: "ok" });
};

Quotation.prototype.findAll = function(db, callback) {
    var quotationList = [];
    var sql =   "SELECT i.id, i.type, i.customer_id, i.ref, i.version, i.creationDt, i.updateDt, i.endValidityDt, i.invoiceStatus, i.globalDiscount, i.deposite, ";
    sql +=      "i.internalNote, i.customerNote, i.payCond_id, pc.label as payCondLabel, pc.tva as payCondTVA, i.parent_id ";
    sql +=      "FROM  invoice as i ";
    sql +=      "INNER JOIN payCondition as pc ON (pc.id = i.payCond_id) ";
    sql +=      "WHERE parent_id is NULL";

    db.all(sql, [], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows)    {
                var seriesFns = [];
                var o = 0;
                rows.forEach(function(row) {
                    var payCondObj = {};
                    lodash.assign(payCondObj, { payCondId: row.payCond_id, payCondLabel: row.payCondLabel, paycondTVA: row.paycondTVA });
                    var quotationObj = {};
                    lodash.assign(quotationObj, { quotationId: row.id, quotationType: row.type, customerId: row.customer_id, quotationRef: row.ref, quotationVersion: row.version, quotationCreationDt: new Date(row.creationDt), quotationUpdateDt: new Date(row.updateDt), quotationEndValidityDt: new Date(row.endValidityDt), quotationStatus: row.invoiceStatus, quotationGlobalDiscount: row.globalDiscount, quotationRealDeposite: row.deposite, quotationInternalNote: row.internalNote, quotationCustomerNote: row.customerNote, payCondObj: payCondObj, quotationParentId: row.parent_id });
                    quotationList.push(quotationObj);
                    seriesFns.push(function(c) {
                        customer.findById(db, { customerId: quotationList[o].customerId }, function(err, customerObj) {
                            quotationList[o].customerObj = customerObj;
                            // need to calculate total
                            // so need to get all presta related to the current quotation/invoice
                            presta.findAllByQuotationId(db, { quotationId: quotationList[o].quotationId }, function(err, prestaList) {
                                quotationList[o].quotationPrestaList = prestaList;
                                o++;
                                c(err, null);
                            });
                        });
                    });
                });
                async.series(seriesFns,
                    function(err, obj) {
                        if (err) callback(err, []);
                        else {
                            callback(null, quotationList);
                        }
                    }
                );
            } else callback(null, quotationList);
        }
    });
};

Quotation.prototype.delById = function(db, param, callback) {
    if (param.quotationId && param.quotationId > 0) {
        // existing
        // console.log("** Start delete quotation " + param.quotationId);
        // 1. delete all docs linked to invoice
        doc.delByQuotationId(db, param, function(err) { // don't care if something has been deleted...
            if (err) callback(err);
            else {
                // 2. delete all payType linked to invoice
                paytype.delByQuotationId(db, param, function(err) { // don't care if something has been deleted...
                    if (err) callback(err);
                    else {
                        // 3. delete all payment linked to invoice
                        payment.delByQuotationId(db, param, function(err) { // don't care if something has been deleted...
                            if (err) callback(err);
                            else {
                                // 4. delete all presta linked to invoice
                                presta.delByQuotationId(db, param, function(err) { // don't care if something has been deleted...
                                    if (err) callback(err);
                                    else {
                                        // 3. delete the quotation itself
                                        db.run("DELETE FROM invoice WHERE id = ?",
                                            [ param.quotationId ],
                                            function (err, row) {
                                                if (err) callback(err);
                                                else {
                                                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok"});
                                                    else                                    callback(null, {msg:"nok"});
                                                }
                                            }
                                        ); // quotation deletion
                                    }
                                }); // presta deletion
                            }
                        }); // payment deletion
                    }
                }); // payType deletion
            }
        }); // docs deletion

    } else callback(null, {msg:"nok"});
};

module.exports = new Quotation();

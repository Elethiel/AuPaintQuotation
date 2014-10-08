var paytype = require("../model/payTypeObj");
var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");
var async = require("async");

// db.run("CREATE TABLE payment (id INTEGER PRIMARY KEY AUTOINCREMENT, payType_id INT, amount REAL, datePaid DATE, statusPaid TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'payment'); } });

var Payment = function() {};

Payment.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    if (param.paymentId && param.paymentId > 0) {
        // existing (update)
        db.run("UPDATE payment SET payType_id = ?, amount = ?, datePaid = ?, statusPaid = ? WHERE id = ?",
            [ param.payTypeObj.payTypeId, param.paymentAmount, param.paymentDatePaid, "", param.paymentId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", paymentId : param.paymentId});
                    else                                    callback(null, {msg:"nok", paymentId: 0});
                }
            }
        ); // update
    } else {
        // new (insert)
        db.run("INSERT INTO payment (payType_id, amount, datePaid, statusPaid) VALUES(?, ?, ?, ?)",
            [ param.payTypeObj.payTypeId, param.paymentAmount, param.paymentDatePaid, "" ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg:"ok", paymentId : this.lastID});
                    else                callback(null, {msg:"nok", paymentId: 0});
                }
            }
        ); // insert
    }
};

Payment.prototype.findById = function(db, param, callback) {
    if (param.paymentId && param.paymentId > 0) {
        //console.log("** START find payment " + param.paymentId);
        var PaymentObj = {};
        db.get("SELECT id, payType_id, amount, datePaid, statusPaid  FROM payment WHERE id = ?", [ param.paymentId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    lodash.assign(PaymentObj, { paymentId: row.id, payTypeId: row.payType_id, paymentAmount: row.amount, paymentDatePaid: new Date(row.datePaid), paymentStatus: row.statusPaid });
                    // get payType Obj
                    paytype.findById(db, PaymentObj, function (err, payTypeObj) {
                        if (err) callback(err);
                        else {
                            PaymentObj.payTypeObj = payTypeObj;
                            callback(null, PaymentObj);
                        }
                    });
                } else callback();
            }
        });
    } else callback();
};

Payment.prototype.findAllByQuotationId = function( db, param, callback ) {
    var self = this;
    db.all("SELECT payment_id FROM invoice_payment WHERE invoice_id = ?", [ param.quotationId ], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows) {
                var seriesFns = [];
                rows.forEach(function(row) {
                    seriesFns.push(function(c) {
                        self.findById(db, { paymentId: row.payment_id }, function(err, paymentObj) {
                            c(err, paymentObj);
                        });
                    });
                });
                async.series(seriesFns,
                    function(err, paymentList) {
                        if (err) callback(err, []);
                        else callback(null, paymentList);
                    }
                );
            } else {
                callback(null, []);
            }
        }
    });
};

Payment.prototype.delByQuotationId = function(db, param, callback) {
    if (param.quotationId && param.quotationId > 0) {
        // existing
        db.run("DELETE FROM invoice_payment WHERE invoice_id = ?",
            [ param.quotationId ],
            function(err, row) {
                if (err) callback(err);
                else callback(null, {msg:"ok", paymentId: 0});
            }
        ); // paycond deletion
    } else callback(null, {msg:"nok", paymentId: 0});
};

module.exports = new Payment();

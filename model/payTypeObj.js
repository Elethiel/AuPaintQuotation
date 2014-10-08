var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");
var async = require("async");

// db.run("CREATE TABLE payType (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'payType'); } });

var PayType = function() {};

PayType.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    if (param.payTypeId && param.payTypeId > 0) {
        // existing (update)
        db.run("UPDATE payType SET label = ? WHERE id = ?",
            [ param.payTypeLabel, param.payTypeId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", payTypeId : param.payTypeId});
                    else                                    callback(null, {msg:"nok", payTypeId: 0});
                }
            }
        ); // update
    } else {
        // new (insert)
        db.run("INSERT INTO payType (label) VALUES(?)",
            [ param.payTypeLabel ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg:"ok", payTypeId : this.lastID});
                    else                callback(null, {msg:"nok", payTypeId: 0});
                }
            }
        ); // insert
    }
};

PayType.prototype.findById = function(db, param, callback) {
    if (param.payTypeId && param.payTypeId > 0) {
        //console.log("** START find payType " + param.payTypeId);

        var PayTypeObj = {};
        db.get("SELECT id, label  FROM payType WHERE id = ?", [ param.payTypeId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    lodash.assign(PayTypeObj, {payTypeId: row.id, payTypeLabel: row.label });
                    callback(null, PayTypeObj);
                } else callback();
            }
        });
    } else callback();
};

PayType.prototype.findAll = function(db, callback) {
    var PayTypeList = [];
    db.all("SELECT id, label  FROM payType", [], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows)    {
                rows.forEach(function(row) {
                    var PayTypeObj = {};
                    lodash.assign(PayTypeObj, {payTypeId: row.id, payTypeLabel: row.label });
                    PayTypeList.push(PayTypeObj);
                });
            }
            callback(null, PayTypeList);
        }
    });
};

PayType.prototype.findAllByQuotationId = function( db, param, callback ) {
    var self = this;
    db.all("SELECT payType_id FROM invoice_paytype WHERE invoice_id = ?", [ param.quotationId ], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows) {
                var seriesFns = [];
                rows.forEach(function(row) {
                    seriesFns.push(function(c) {
                        self.findById(db, { payTypeId: row.payType_id }, function(err, payTypeObj) {
                            c(err, payTypeObj);
                        });
                    });
                });
                async.series(seriesFns,
                    function(err, payTypeList) {
                        if (err) callback(err, []);
                        else callback(null, payTypeList);
                    }
                );
            } else {
                callback(null, []);
            }
        }
    });
};

PayType.prototype.delById = function(db, param, callback) {
    if (param.payTypeId && param.payTypeId > 0) {
        // existing
        db.get("SELECT COUNT(invoice_id) as nb FROM invoice_paytype WHERE payType_id = ?",
            [ param.payTypeId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    nbInvoice = 0;
                    if (row && row.nb > 0) nbInvoice = row.nb;
                    db.get("SELECT COUNT(id) as nb FROM payment WHERE payType_id = ?",
                        [ param.payTypeId ],
                        function(err, row) {
                            if (err) callback(err);
                            else {
                                if (row && row.nb > 0) {
                                    // console.log("Functional Error payType : already used by " + nbInvoice + " invoice / " + row.nb + " payment");
                                    callback(null, {msg:"rej", payTypNb : [nbInvoice, row.nb] });
                                } else {
                                    db.run("DELETE FROM payType WHERE id = ?",
                                        [ param.payTypeId ],
                                        function(err, row) {
                                            if (err) callback(err);
                                            else {
                                                if (this.changes && this.changes > 0)   callback(null, {msg:"ok", payTypeId : this.changes});
                                                else                                    callback(null, {msg:"nok", payTypeId: 0});
                                            }
                                        }
                                    ); // paytype deletion
                                }
                            }
                        }
                    ); // get related payments
                }
            }
        ); // get related incoices
    } else callback(null, {msg:"nok", payTypeId: 0});
};

PayType.prototype.delByQuotationId = function(db, param, callback) {
    if (param.quotationId && param.quotationId > 0) {
        // existing
        db.run("DELETE FROM invoice_paytype WHERE invoice_id = ?",
            [ param.quotationId ],
            function(err, row) {
                if (err) callback(err);
                else callback(null, {msg:"ok", payTypeId: 0});
            }
        ); // paycond deletion
    } else callback(null, {msg:"nok", payTypeId: 0});
};

module.exports = new PayType();

var product = require("../model/productObj");
var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");
var async = require("async");

// db.run("CREATE TABLE presta (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INT, quantity INT, discount REAL, freefield TEXT, ord INT, ST INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'presta'); } });

var Presta = function() {};

Presta.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    if (param.prestaId && param.prestaId > 0) {
        // existing (update)
        db.run("UPDATE presta SET product_id = ?, quantity = ?, discount = ?, freefield = ?, ord = ?, ST = ? WHERE id = ?",
            [ param.productObj ? param.productObj.productId : null, param.prestaQuantity, param.prestaDiscount, param.prestaFreeField, param.prestaOrd, param.prestaST, param.prestaId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", prestaId : param.prestaId});
                    else                                    callback(null, {msg:"nok", prestaId: 0});
                }
            }
        ); // update
    } else {
        // new (insert)
        db.run("INSERT INTO presta (product_id, quantity, discount, freefield, ord, ST) VALUES(?, ?, ?, ?, ?, ?)",
            [ param.productObj ? param.productObj.productId : null, param.prestaQuantity, param.prestaDiscount, param.prestaFreeField, param.prestaOrd, param.prestaST ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg:"ok", prestaId : this.lastID});
                    else                callback(null, {msg:"nok", prestaId: 0});
                }
            }
        ); // insert
    }
};

Presta.prototype.findById = function(db, param, callback) {
    if (param.prestaId && param.prestaId > 0) {
        //console.log("** START find presta " + param.prestaId);
        var PrestaObj = {};
        db.get("SELECT id, product_id, quantity, discount, freefield, ord, ST  FROM presta WHERE id = ?", [ param.prestaId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    lodash.assign(PrestaObj, { prestaId: row.id, productId: row.product_id, prestaQuantity: row.quantity, prestaDiscount: row.discount, prestaFreeField: row.freefield, prestaOrd: row.ord, prestaST: row.ST });
                    // get payType Obj
                    product.findById(db, PrestaObj, function (err, productObj) {
                        if (err) callback(err);
                        else {
                            PrestaObj.productObj = product.getFlatVersion(productObj);
                            callback(null, PrestaObj);
                        }
                    });
                } else callback();
            }
        });
    } else callback();
};

Presta.prototype.findAllByQuotationId = function( db, param, callback ) {
    var self = this;
    db.all("SELECT ip.presta_id, p.ord FROM invoice_presta ip INNER JOIN presta p ON p.id = ip.presta_id WHERE ip. invoice_id = ? ORDER BY p.ord ASC", [ param.quotationId ], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows) {
                var seriesFns = [];
                rows.forEach(function(row) {
                    seriesFns.push(function(c) {
                        self.findById(db, { prestaId: row.presta_id }, function(err, prestaObj) {
                            c(err, prestaObj);
                        });
                    });
                });
                async.series(seriesFns,
                    function(err, prestaList) {
                        if (err) callback(err, []);
                        else callback(null, prestaList);
                    }
                );
            } else {
                callback(null, []);
            }
        }
    });
};

Presta.prototype.delByQuotationId = function(db, param, callback) {
    if (param.quotationId && param.quotationId > 0) {
        // existing
        db.run("DELETE FROM presta WHERE id in (SELECT presta_id FROM invoice_presta WHERE invoice_id = ?)",
            [ param.quotationId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    db.run("DELETE FROM invoice_presta WHERE invoice_id = ?",
                        [ param.quotationId ],
                        function(err, row) {
                            if (err) callback(err);
                            else callback(null, {msg:"ok", prestaId: 0});
                        }
                    );
                }
            }
        ); // paycond deletion
    } else callback(null, {msg:"nok", prestaId: 0});
};

module.exports = new Presta();

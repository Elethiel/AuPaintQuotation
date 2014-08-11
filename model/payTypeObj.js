var lodash = require("lodash");
var util = require('util');
var tools = require('../model/_tools');

// db.run("CREATE TABLE payType (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'payType'); } });

var PayType = function() {};

PayType.prototype.insertUpdate = function(db, param, next, callback) {
    
    if (!param.notstring) tools.manageString(param);
    
    if (param.payTypeId && param.payTypeId > 0) {
        // existing (update)
        db.run("UPDATE payType SET label = ? WHERE id = ?",
                [ param.payTypeLabel, param.payTypeId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error update payType '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (this.changes && this.changes > 0)    {
                            console.log("update payType OK (" + this.changes + ") : " + param.payTypeId);
                            callback({msg:"ok", payTypeId : this.changes});
                        } else {
                            console.log("update payType NOK");
                            callback({msg:"nok", payTypeId: 0});
                        }
                    }
                });
    } else {
        // new (insert)
        db.run("INSERT INTO payType (label) VALUES(?)",
                [ param.payTypeLabel ],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error insert payType '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (this.lastID)    {
                            console.log("insert payType OK : " + this.lastID);
                            callback({msg:"ok", payTypeId : this.lastID});
                        } else {
                            console.log("insert payType NOK");
                            callback({msg:"nok", payTypeId: 0});
                        }
                    }
                });
    }
};

PayType.prototype.findById = function( db, data, next, callback) {
    if (data.payTypeId && data.payTypeId > 0) {
        //console.log("** START find payType " + data.payTypeId);
        var PayTypeObj = {};
        db.get("SELECT id, label  FROM payType WHERE id = ?", [data.payTypeId], function(err, row) {
            if(err) {
                console.log('SQL Error findpayType '  + util.inspect(err, false, null));
                next(err);
            } else {
                if (row)    {
                    lodash.assign(PayTypeObj, {payTypeId: row.id, payTypeLabel: row.label });
                    callback(PayTypeObj);
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
};

PayType.prototype.findAll = function( db, next, callback) {
    var PayTypeList = [];
    db.all("SELECT id, label  FROM payType", [], function(err, rows) {
        if(err) {
            console.log('SQL Error findAllPayType '  + util.inspect(err, false, null));
            next(err);
        } else {
            if (rows)    {
                rows.forEach(function(row) {
                    var PayTypeObj = {};
                    lodash.assign(PayTypeObj, {payTypeId: row.id, payTypeLabel: row.label });
                    PayTypeList.push(PayTypeObj);
                });
            }
                
            callback(PayTypeList);
        }
    });
};

PayType.prototype.delById = function(db, param, next, callback) {
    if (param.payTypeId && param.payTypeId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM invoice_paytype WHERE payType_id = ?",
                [ param.payTypeId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error delete payType check relation '+ util.inspect(err, false, null));
                        next(err);
                    } else {
                        nbInvoice = 0;
                        if (row && row.nb > 0) nbInvoice = row.nb;
                        db.get("SELECT COUNT(id) as nb FROM payment WHERE payType_id = ?",
                            [ param.payTypeId],
                            function(err, row) {
                                if(err) {
                                    console.log('SQL Error delete payType check relation 2 '+ util.inspect(err, false, null));
                                    next(err);
                                } else {
                                    if (row && row.nb > 0) {
                                        console.log("Functional Error payType : already used by " + nbInvoice + " invoice / " + row.nb + " payment");
                                        callback({msg:"rej", payTypNb : [nbInvoice, row.nb] });
                                    } else {
                                        db.run("DELETE FROM payType WHERE id = ?",
                                            [ param.payTypeId],
                                            function(err, row) {
                                                if(err) {
                                                    console.log('SQL Error delete payType '+ util.inspect(err, false, null));
                                                   next(err);
                                                } else {
                                                    if (this.changes && this.changes > 0)    {
                                                        console.log("delete payType OK (" + this.changes + ") : " + param.payTypeId);
                                                        callback({msg:"ok", payTypeId : this.changes});
                                                    } else {
                                                        console.log("delete payType NOK");
                                                        callback({msg:"nok", payTypeId: 0});
                                                    }
                                                }
                                            });
                                    }
                                }
                            });
                        }
                });
    } else callback({msg:"nok", payTypeId: 0});
}

module.exports = new PayType();

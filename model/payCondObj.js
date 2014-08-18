var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");

// db.run("CREATE TABLE payCondition (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'payCondition'); } });

var PayCond = function() {};

PayCond.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    if (param.payCondId && param.payCondId > 0) {
        // existing (update)
        db.run("UPDATE payCondition SET label = ? WHERE id = ?",
            [ param.payCondLabel, param.payCondId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", payCondId : param.payCondId});
                    else                                    callback(null, {msg:"nok", payCondId: 0});
                }
            }
        ); // update
    } else {
        // new (insert)
        db.run("INSERT INTO payCondition (label) VALUES(?)",
            [ param.payCondLabel ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg:"ok", payCondId : this.lastID});
                    else                callback(null, {msg:"nok", payCondId: 0});
                }
            }
        ); // insert
    }
};

PayCond.prototype.findById = function(db, param, callback) {
    if (param.payCondId && param.payCondId > 0) {
        //console.log("** START find payCond " + param.payCondId);
        var PayCondObj = {};
        db.get("SELECT id, label  FROM payCondition WHERE id = ?", [ param.payCondId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    lodash.assign(PayCondObj, {payCondId: row.id, payCondLabel: row.label });
                    callback(null, PayCondObj);
                } else callback();
            }
        });
    } else callback();
};

PayCond.prototype.findAll = function(db, callback) {
    var PayCondList = [];
    db.all("SELECT id, label  FROM payCondition", [], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows) {
                rows.forEach(function(row) {
                    var PayCondObj = {};
                    lodash.assign(PayCondObj, {payCondId: row.id, payCondLabel: row.label });
                    PayCondList.push(PayCondObj);
                });
            }
            callback(null, PayCondList);
        }
    });
};

PayCond.prototype.delById = function(db, param, callback) {
    if (param.payCondId && param.payCondId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM invoice WHERE payCond_id = ?",
            [ param.payCondId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (row && row.nb > 0) {
                        //console.log("Functional Error payCondition : already used by " + row.nb + " invoice");
                        callback(null, {msg:"rej", payConditionNb : row.nb});
                    } else {
                        db.run("DELETE FROM payCondition WHERE id = ?",
                            [ param.payCondId ],
                            function(err, row) {
                                if (err) callback(err);
                                else {
                                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", payCondId : this.changes});
                                    else                                    callback(null, {msg:"nok", payCondId: 0});
                                }
                            }
                        ); // paycond deletion
                    }
                }
            }
        ); // get related invoices
    } else callback(null, {msg:"nok", payCondId: 0});
};

module.exports = new PayCond();

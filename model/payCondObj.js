var lodash = require("lodash");
var util = require('util');
var tools = require('../model/_tools');

// db.run("CREATE TABLE payCondition (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'payCondition'); } });

var PayCond = function() {};

PayCond.prototype.insertUpdate = function(db, param, next, callback) {
    
    if (!param.notstring) tools.manageString(param);
    
    if (param.payCondId && param.payCondId > 0) {
        // existing (update)
        db.run("UPDATE payCondition SET label = ? WHERE id = ?",
                [ param.payCondLabel, param.payCondId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error update payCond '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (this.changes && this.changes > 0)    {
                            console.log("update payCond OK (" + this.changes + ") : " + param.payCondId);
                            callback({msg:"ok", payCondId : this.changes});
                        } else {
                            console.log("update payCond NOK");
                            callback({msg:"nok", payCondId: 0});
                        }
                    }
                });
    } else {
        // new (insert)
        db.run("INSERT INTO payCondition (label) VALUES(?)",
                [ param.payCondLabel ],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error insert payCond '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (this.lastID)    {
                            console.log("insert payCond OK : " + this.lastID);
                            callback({msg:"ok", payCondId : this.lastID});
                        } else {
                            console.log("insert payCond NOK");
                            callback({msg:"nok", payCondId: 0});
                        }
                    }
                });
    }
};

PayCond.prototype.findById = function( db, data, next, callback) {
    if (data.payCondId && data.payCondId > 0) {
        //console.log("** START find payCond " + data.payCondId);
        var PayCondObj = {};
        db.get("SELECT id, label  FROM payCondition WHERE id = ?", [data.payCondId], function(err, row) {
            if(err) {
                console.log('SQL Error findpayCond '  + util.inspect(err, false, null));
                next(err);
            } else {
                if (row)    {
                    lodash.assign(PayCondObj, {payCondId: row.id, payCondLabel: row.label });
                    callback(PayCondObj);
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
};

PayCond.prototype.findAll = function( db, next, callback) {
    var PayCondList = [];
    db.all("SELECT id, label  FROM payCondition", [], function(err, rows) {
        if(err) {
            console.log('SQL Error findAllPayCond '  + util.inspect(err, false, null));
            next(err);
        } else {
            if (rows)    {
                rows.forEach(function(row) {
                    var PayCondObj = {};
                    lodash.assign(PayCondObj, {payCondId: row.id, payCondLabel: row.label });
                    PayCondList.push(PayCondObj);
                });
            }
                
            callback(PayCondList);
        }
    });
};

PayCond.prototype.delById = function(db, param, next, callback) {
    if (param.payCondId && param.payCondId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM invoice WHERE payCond_id = ?",
                [ param.payCondId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error delete payCondition check relation '+ util.inspect(err, false, null));
                        next(err);
                    } else {
                        if (row && row.nb > 0) {
                            console.log("Functional Error payCondition : already used by " + row.nb + " invoice");
                            callback({msg:"rej", payConditionNb : row.nb});
                        } else {
                            db.run("DELETE FROM payCondition WHERE id = ?",
                                [ param.payCondId],
                                function(err, row) {
                                    if(err) {
                                        console.log('SQL Error delete payCond '+ util.inspect(err, false, null));
                                       next(err);
                                    } else {
                                        if (this.changes && this.changes > 0)    {
                                            console.log("delete payCond OK (" + this.changes + ") : " + param.payCondId);
                                            callback({msg:"ok", payCondId : this.changes});
                                        } else {
                                            console.log("delete payCond NOK");
                                            callback({msg:"nok", payCondId: 0});
                                        }
                                    }
                                });
                        }
                    }
                });
    } else callback({msg:"nok", payCondId: 0});
}

module.exports = new PayCond();

var lodash = require("lodash");
var util = require('util');
var tva = require('../model/tvaObj');
var tools = require('../model/_tools');

// db.run("CREATE TABLE groupProduct (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT, icon TEXT, tva_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'group'); } });

var GroupProduct = function() {};

GroupProduct.prototype.insertUpdate = function(db, param, next, callback) {
    
    if (!param.notstring) tools.manageString(param);
    
    if (param.groupProductId && param.groupProductId > 0) {
        // existing (update)
        db.run("UPDATE groupProduct SET label = ?, icon = ?, tva_id = ? WHERE id = ?",
                [ param.groupProductLabel, param.groupProductIcon, param.TVAId, param.groupProductId],
                function (err, row) {
                    if(err) {
                        console.log('SQL Error update groupProduct '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (this.changes && this.changes > 0)    {
                            console.log("update groupProduct OK (" + this.changes + ") : " + param.groupProductId);
                            callback({msg:"ok", groupProductId : this.changes});
                        } else {
                            console.log("update groupProduct NOK");
                            callback({msg:"nok", groupProductId: 0});
                        }
                    }
                });
    } else {
        // new (insert)
        db.run("INSERT INTO groupProduct (label, icon, tva_id) VALUES(?, ?, ?)",
                [ param.groupProductLabel, param.groupProductIcon, param.TVAId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error insert groupProduct '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (this.lastID)    {
                            console.log("insert groupProduct OK : " + this.lastID);
                            callback({msg:"ok", groupProductId : this.lastID});
                        } else {
                            console.log("insert groupProduct NOK");
                            callback({msg:"nok", groupProductId: 0});
                        }
                    }
                });
    }
};

GroupProduct.prototype.findById = function( db, data, next, callback) {
    if (data.groupProductId && data.groupProductId > 0) {
        console.log("** START find groupProduct " + data.groupProductId);
        var groupProductObj = {};
        db.get("SELECT id, label, icon, tva_id FROM groupProduct WHERE id = ?", [data.groupProductId], function(err, row) {
            if(err) {
                console.log('SQL Error findGroupProduct '  + util.inspect(err, false, null));
                next(err);
            } else {
                if (row)    {
                    // fill the contact object now
                    tva.findById(db, {TVAId: row.tva_id}, next, function(TVAObj) {
                        lodash.assign(groupProductObj, {groupProductId: row.id, groupProductLabel: row.label, groupProductIcon: row.icon, TVAObj: TVAObj });

                        //console.log("** find groupProduct " + util.inspect(groupProductObj, false, null));
                        callback(groupProductObj);
                    });
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
};

GroupProduct.prototype.getFlatVersion = function(groupProductObj) {
    if (groupProductObj) {
        lodash.assign(groupProductObj, groupProductObj.TVAObj);
        delete groupProductObj.TVAObj;

    }
    return groupProductObj;
}

GroupProduct.prototype.findAll = function( db, next, callback) {
    var groupProductList = [];
    db.all("SELECT gp.id, gp.label, gp.icon, tva.id as TVAId, tva.label as TVALabel, tva.percent as TVAPercent  FROM groupProduct as gp INNER JOIN tva ON (tva.id = gp.tva_id)", [], function(err, rows) {
        if(err) {
            console.log('SQL Error findAllGroupProduct '  + util.inspect(err, false, null));
            next(err);
        } else {
            if (rows)    {
                rows.forEach(function(row) {
                    var groupProductObj = {};
                    lodash.assign(groupProductObj, {groupProductId: row.id, groupProductLabel: row.label, groupProductIcon: row.icon, TVAId: row.TVAId, TVALabel: row.TVALabel, TVAPercent: row.TVAPercent });
                    groupProductList.push(groupProductObj);
                });
            }

            callback(groupProductList);
        }
    });
};

GroupProduct.prototype.delById = function(db, param, next, callback) {
    if (param.groupProductId && param.groupProductId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM product WHERE group_id = ?",
                [ param.groupProductId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error delete groupProduct check relation '+ util.inspect(err, false, null));
                        next(err);
                    } else {
                        if (row && row.nb > 0) {
                            console.log("Functional Error groupProduct : already used by " + row.nb + " product");
                            callback({msg:"rej", groupProductNb : row.nb});
                        } else {
                            db.run("DELETE FROM groupProduct WHERE id = ?",
                                [ param.groupProductId],
                                function (err, row) {
                                    if(err) {
                                        console.log('SQL Error delete groupProduct '+ util.inspect(err, false, null));
                                       next(err);
                                    } else {
                                        if (this.changes && this.changes > 0)    {
                                            console.log("delete groupProduct OK (" + this.changes + ") : " + param.groupProductId);
                                            callback({msg:"ok", groupProductId : this.changes});
                                        } else {
                                            console.log("delete groupProduct NOK");
                                            callback({msg:"nok", groupProductId: 0});
                                        }
                                    }
                                });
                        }
                    }
                });
    } else callback({msg:"nok", groupProductId: 0});
};

module.exports = new GroupProduct();

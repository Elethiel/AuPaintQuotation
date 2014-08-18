var tva = require("../model/tvaObj");
var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");

// db.run("CREATE TABLE groupProduct (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT, icon TEXT, tva_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'group'); } });

var GroupProduct = function() {};

GroupProduct.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    if (param.groupProductId && param.groupProductId > 0) {
        // existing (update)
        db.run("UPDATE groupProduct SET label = ?, icon = ?, tva_id = ? WHERE id = ?",
            [ param.groupProductLabel, param.groupProductIcon, param.TVAId, param.groupProductId ],
            function (err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", groupProductId : param.groupProductId});
                    else                                    callback(null, {msg:"nok", groupProductId: 0});
                }
            }
        ); // update
    } else {
        // new (insert)
        db.run("INSERT INTO groupProduct (label, icon, tva_id) VALUES(?, ?, ?)",
            [ param.groupProductLabel, param.groupProductIcon, param.TVAId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg:"ok", groupProductId : this.lastID});
                    else                callback(null, {msg:"nok", groupProductId: 0});
                }
            }
        ); // insert
    }
};

GroupProduct.prototype.findById = function(db, param, callback) {
    if (param.groupProductId && param.groupProductId > 0) {
        //console.log("** START find groupProduct " + param.groupProductId);

        var groupProductObj = {};
        db.get("SELECT id, label, icon, tva_id FROM groupProduct WHERE id = ?", [ param.groupProductId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row) {
                    // fill the contact object now
                    tva.findById(db, {TVAId: row.tva_id}, function(err, TVAObj) {
                        if (err) callback(err);
                        else {
                            lodash.assign(groupProductObj, {groupProductId: row.id, groupProductLabel: row.label, groupProductIcon: row.icon, TVAObj: TVAObj });

                            //console.log("** find groupProduct " + util.inspect(groupProductObj, false, null));
                            callback(null, groupProductObj);
                        }
                    });
                } else callback();
            }
        });
    } else callback();
};

GroupProduct.prototype.getFlatVersion = function(groupProductObj) {
    if (groupProductObj) {
        lodash.assign(groupProductObj, groupProductObj.TVAObj);
        delete groupProductObj.TVAObj;
    }
    return groupProductObj;
}

GroupProduct.prototype.findAll = function(db, callback) {
    var groupProductList = [];
    db.all("SELECT gp.id, gp.label, gp.icon, tva.id as TVAId, tva.label as TVALabel, tva.percent as TVAPercent  FROM groupProduct as gp INNER JOIN tva ON (tva.id = gp.tva_id)", [], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows) {
                rows.forEach(function(row) {
                    var groupProductObj = {};
                    lodash.assign(groupProductObj, {groupProductId: row.id, groupProductLabel: row.label, groupProductIcon: row.icon, TVAId: row.TVAId, TVALabel: row.TVALabel, TVAPercent: row.TVAPercent });
                    groupProductList.push(groupProductObj);
                });
            }
            callback(null, groupProductList);
        }
    });
};

GroupProduct.prototype.delById = function(db, param, callback) {
    if (param.groupProductId && param.groupProductId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM product WHERE group_id = ?",
            [ param.groupProductId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (row && row.nb > 0) {
                        // console.log("Functional Error groupProduct : already used by " + row.nb + " product");
                        callback(null, {msg:"rej", groupProductNb : row.nb});
                    } else {
                        db.run("DELETE FROM groupProduct WHERE id = ?",
                            [ param.groupProductId ],
                            function (err, row) {
                                if (err) callback(err);
                                else {
                                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", groupProductId : this.changes});
                                    else                                    callback(null, {msg:"nok", groupProductId: 0});
                                }
                            }
                        ); // groupproduct deletion
                    }
                }
            }
        ); // get related products
    } else callback(null, {msg:"nok", groupProductId: 0});
};

module.exports = new GroupProduct();

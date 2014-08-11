var groupProduct = require('../model/groupProductObj');
var lodash = require("lodash");
var util = require('util');
var tools = require('../model/_tools');

// db.run("CREATE TABLE product (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INT, label TEXT, code TEXT, ttc REAL, unit TEXT, paid REAL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'product'); } });

var Product = function() {};

Product.prototype.insertUpdate = function(db, param, next, callback) {
    
    if (!param.notstring) tools.manageString(param);
    
    if (param.productId && param.productId > 0) {
        // existing (update)
        // 1. Check the code as unique
        db.get("SELECT id FROM product WHERE code = ? AND id <> ?",
                [param.productCode, param.productId],
                function(err, row) {
                    if (err) {
                        console.log("SQL Error update check unicity of Code " + util.inspect(err, false, null));
                        next(err);
                    } else {
                        if (row && row.id > 0) {
                            console.log("Code is not UniQ ! " + row.id);
                            callback({msg:"unq", productId: row.id});
                        } else {
                            db.run("UPDATE Product SET group_id = ?, label = ?, code = ?, ttc = ?, unit = ?, paid = ? WHERE id = ?",
                                    [ param.groupProductId, param.productLabel, param.productCode, param.productTTC, param.productUnit, param.productPaid, param.productId],
                                    function (err, row) {
                                        if(err) {
                                            console.log("SQL Error update Product " + util.inspect(err, false, null));
                                            next(err);
                                        } else {
                                            if (this.changes && this.changes > 0)    {
                                                console.log("update Product OK (" + this.changes + ") : " + param.productId);
                                                callback({msg:"ok", productId : this.changes});
                                            } else {
                                                console.log("update Product NOK");
                                                callback({msg:"nok", productId: 0});
                                            }
                                        }
                                    });
                        }
                    }
                });
    } else {
        // new (insert)
        // 1. check unicity of code
        db.get("SELECT id FROM product WHERE code = ?",
                [param.productCode],
                function(err, row) {
                    if (err) {
                        console.log("SQL Error insert check unicity of Code " + util.inspect(err, false, null));
                        next(err);
                    } else {
                        if (row && row.id > 0) {
                            console.log("Code is not UniQ ! " + row.id);
                            callback({msg:"unq", productId: row.id});
                        } else {
                            db.run("INSERT INTO Product (group_id, label, code, ttc, unit, paid) VALUES(?, ?, ?, ?, ?, ?)",
                                    [ param.groupProductId, param.productLabel, param.productCode, param.productTTC, param.productUnit, param.productPaid],
                                    function(err, row) {
                                        if(err) {
                                            console.log('SQL Error insert Product '+ util.inspect(err, false, null));
                                           next(err);
                                        } else {
                                            if (this.lastID)    {
                                                console.log("insert Product OK : " + this.lastID);
                                                callback({msg:"ok", productId : this.lastID});
                                            } else {
                                                console.log("insert Product NOK");
                                                callback({msg:"nok", productId: 0});
                                            }
                                        }
                                    });
                        }
                    }
                });
    }
};

Product.prototype.findById = function( db, data, next, callback) {
    if (data.productId && data.productId > 0) {
        console.log("** START find Product " + data.productId);
        var productObj = {};
        db.get("SELECT id, group_id, label, code, ttc, unit, paid FROM Product WHERE id = ?", [data.productId], function(err, row) {
            if(err) {
                console.log('SQL Error findProduct '  + util.inspect(err, false, null));
                next(err);
            } else {
                if (row)    {
                    // fill the contact object now
                    groupProduct.findById(db, {groupProductId: row.group_id}, next, function(groupProductObj) {
                        lodash.assign(productObj, {productId: row.id, productLabel: row.label, productCode: row.code, productTTC: row.ttc, productUnit: row.unit, productPaid: row.paid, groupProductObj: groupProductObj });
                        //console.log("** find Product " + util.inspect(productObj, false, null));
                        callback(productObj);
                    });
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
};

Product.prototype.getFlatVersion = function(productObj) {
    if (productObj) {
        lodash.assign(productObj, groupProduct.getFlatVersion(productObj.groupProductObj));
        delete productObj.groupProductObj;

    }
    return productObj;
}

Product.prototype.findAll = function( db, next, callback) {
    var productList = [];
    db.all("SELECT p.id, p.group_id as groupProductId, p.label, p.code, p.ttc, p.unit, p.paid, gp.label as groupProductLabel, gp.icon as groupProductIcon, gp.tva_id as TVAId, tva.label as TVALabel, tva.percent as TVAPercent  FROM Product as p INNER JOIN groupProduct as gp ON (gp.id = p.group_id) INNER JOIN tva ON (tva.id = gp.tva_id)", [], function(err, rows) {
        if(err) {
            console.log('SQL Error findAllProduct '  + util.inspect(err, false, null));
            next(err);
        } else {
            if (rows)    {
                rows.forEach(function(row) {
                    var productObj = {};
                    lodash.assign(productObj, {productId: row.id, productLabel: row.label, productCode: row.code, productTTC: row.ttc, productUnit: row.unit, productPaid: row.paid, groupProductId: row.groupProductId, groupProductLabel: row.groupProductLabel, groupProductIcon: row.groupProductIcon, TVAId: row.TVAId, TVALabel: row.TVALabel, TVAPercent: row.TVAPercent });
                    productList.push(productObj);
                });
            }

            callback(productList);
        }
    });
};

Product.prototype.delById = function(db, param, next, callback) {
    if (param.productId && param.productId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM presta WHERE product_id = ?", [ param.productId ], function(err, row) {
            if(err) {
                console.log('SQL Error delete Product check relation '+ util.inspect(err, false, null));
                next(err);
            } else {
                if (row && row.nb > 0) {
                    console.log("Functional Error Product : already used by " + row.nb + " Presta");
                    callback({msg:"rej", productNb : row.nb});
                } else {
                    db.run("DELETE FROM Product WHERE id = ?", [ param.productId ], function (err, row) {
                        if(err) {
                            console.log('SQL Error delete Product '+ util.inspect(err, false, null));
                           next(err);
                        } else {
                            if (this.changes && this.changes > 0)    {
                                console.log("delete Product OK (" + this.changes + ") : " + param.productId);
                                callback({msg:"ok", productId : this.changes});
                            } else {
                                console.log("delete Product NOK");
                                callback({msg:"nok", productId: 0});
                            }
                        }
                    });
                }
            }
        });
    } else callback({msg:"nok", productId: 0});
};

module.exports = new Product();

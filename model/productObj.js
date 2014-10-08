var groupProduct = require("../model/groupProductObj");
var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");
var lwip = require("lwip");

// db.run("CREATE TABLE product (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INT, label TEXT, code TEXT, ttc REAL, unit TEXT, paid REAL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'product'); } });

var Product = function() {};

Product.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    if (param.productId && param.productId > 0) {
        // existing (update)
        // 1. Check the code as unique
        db.get("SELECT id FROM product WHERE code = ? AND id <> ?",
            [ param.productCode, param.productId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (row && row.id > 0) {
                        //console.log("Code is not UniQ ! " + row.id);
                        callback(null, {msg:"unq", productId: row.id});
                    } else {
                        db.run("UPDATE Product SET group_id = ?, label = ?, code = ?, ttc = ?, unit = ?, paid = ? WHERE id = ?",
                            [ param.groupProductId, param.productLabel, param.productCode, param.productTTC, param.productUnit, param.productPaid, param.productId ],
                            function (err, row) {
                                if (err) callback(err);
                                else {
                                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", productId : param.productId});
                                    else                                    callback(null, {msg:"nok", productId: 0});
                                }
                            }
                        ); // update
                    }
                }
            }
        ); // check unicity
    } else {
        // new (insert)
        // 1. check unicity of code
        db.get("SELECT id FROM product WHERE code = ?",
            [ param.productCode ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (row && row.id > 0) {
                        // console.log("Code is not UniQ ! " + row.id);
                        callback(null, {msg:"unq", productId: row.id});
                    } else {
                        db.run("INSERT INTO Product (group_id, label, code, ttc, unit, paid) VALUES(?, ?, ?, ?, ?, ?)",
                            [ param.groupProductId, param.productLabel, param.productCode, param.productTTC, param.productUnit, param.productPaid ],
                            function(err, row) {
                                if (err) callback(err);
                                else {
                                    if (this.lastID)    callback(null, {msg:"ok", productId : this.lastID});
                                    else                callback(null, {msg:"nok", productId: 0});
                                }
                            }
                        ); // insert
                    }
                }
            }
        ); // unicity
    }
};

Product.prototype.findById = function(db, param, callback) {
    if (param.productId && param.productId > 0) {
        //console.log("** START find Product " + param.productId);
        var productObj = {};
        db.get("SELECT id, group_id, label, code, ttc, unit, paid FROM Product WHERE id = ?", [ param.productId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    // fill the contact object now
                    groupProduct.findById(db, {groupProductId: row.group_id}, function(err, groupProductObj) {
                        if (err) callback(err);
                        else {
                            lodash.assign(productObj, {productId: row.id, productLabel: row.label, productCode: row.code, productTTC: row.ttc, productUnit: row.unit, productPaid: row.paid, groupProductObj: groupProductObj });
                            //console.log("** find Product " + util.inspect(productObj, false, null));
                            callback(null, productObj);
                        }
                    });
                } else callback();
            }
        });
    } else callback();
};

Product.prototype.getFlatVersion = function(productObj) {
    if (productObj) {
        lodash.assign(productObj, groupProduct.getFlatVersion(productObj.groupProductObj));
        delete productObj.groupProductObj;

    }
    return productObj;
};

Product.prototype.findAll = function(db, callback) {
    var productList = [];
    db.all("SELECT p.id, p.group_id as groupProductId, p.label, p.code, p.ttc, p.unit, p.paid, gp.label as groupProductLabel, gp.icon as groupProductIcon, gp.tva_id as TVAId, tva.label as TVALabel, tva.percent as TVAPercent  FROM Product as p INNER JOIN groupProduct as gp ON (gp.id = p.group_id) INNER JOIN tva ON (tva.id = gp.tva_id)", [], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows) {
                rows.forEach(function(row) {
                    var productObj = {};
                    lodash.assign(productObj, {productId: row.id, productLabel: row.label, productCode: row.code, productTTC: row.ttc, productUnit: row.unit, productPaid: row.paid, groupProductId: row.groupProductId, groupProductLabel: row.groupProductLabel, groupProductIcon: row.groupProductIcon, TVAId: row.TVAId, TVALabel: row.TVALabel, TVAPercent: row.TVAPercent });
                    if (productObj.groupProductIcon) {
                        lwip.open("./client" + productObj.groupProductIcon, function(err, image) {
                            if (!err) {
                                productObj.groupProductIconW = image.width();
                                productObj.groupProductIconH = image.height();
                            }
                        });
                    }
                    productList.push(productObj);
                });
            }
            callback(null, productList);
        }
    });
};

Product.prototype.delById = function(db, param, callback) {
    if (param.productId && param.productId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM presta WHERE product_id = ?", [ param.productId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row && row.nb > 0) {
                    //console.log("Functional Error Product : already used by " + row.nb + " Presta");
                    callback(null, {msg:"rej", productNb : row.nb});
                } else {
                    db.run("DELETE FROM Product WHERE id = ?", [ param.productId ], function (err, row) {
                        if (err) callback(err);
                        else {
                            if (this.changes && this.changes > 0)   callback(null, {msg:"ok", productId : this.changes});
                            else                                    callback(null, {msg:"nok", productId: 0});
                        }
                    }); // deletion of product
                }
            }
        }); // get related presta
    } else callback(null, {msg:"nok", productId: 0});
};

module.exports = new Product();

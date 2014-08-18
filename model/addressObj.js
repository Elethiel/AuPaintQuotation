var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");

// db.run("CREATE TABLE address (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, line1 TEXT, line2 TEXT, cp TEXT, city TEXT, country TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'address'); } });                        

var Address = function() {};

Address.prototype.insertUpdate = function(db, param, callback) {
    
    if (!param.notstring) tools.manageString(param);
    
    if (param.addressId && param.addressId > 0) {
        // existing (update)
        db.run("UPDATE address SET url = ?, line1 = ?, line2 = ?, cp = ?, city = ?, country = ? WHERE id = ?",
            [ param.addressURL, param.addressLine1, param.addressLine2, param.addressCP, param.addressCity, param.addressCountry, param.addressId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", addressId: param.addressId});
                    else                                    callback(null, {msg:"nok", addressId: 0});
                }
            }
        ); // update
    } else {
        // new (insert)
        db.run("INSERT INTO address (url, line1, line2, cp, city, country) VALUES( ?, ?, ?, ?, ?, ?)",
            [ param.addressURL, param.addressLine1, param.addressLine2, param.addressCP, param.addressCity, param.addressCountry ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg:"ok", addressId: this.lastID});
                    else                callback(null, {msg:"nok", addressId: 0});
                }
            }
        ); // insert
    }
};

Address.prototype.findById = function(db, param, callback) {
    if (param.addressId && param.addressId > 0) {
        //console.log("** START find ADDRESS " + param.addressId);
        var addressObj = {};
        db.get("SELECT id, url, line1, line2, cp, city, country  FROM address WHERE id = ?", [ param.addressId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row) {
                    lodash.assign( addressObj, {addressId: row.id, addressURL: row.url, addressLine1: row.line1, addressLine2: row.line2, addressCP: row.cp, addressCity: row.city, addressCountry: row.country });
                    callback(null, addressObj);
                } else callback();
            }
        });
    } else callback();
};

Address.prototype.delById = function(db, param, callback) {
    if (param.addressId && param.addressId > 0) db.run("DELETE FROM Address WHERE id = ?",  [ param.addressId ], function(err, row) { callback(err); } );
    else callback();
};

module.exports = new Address();

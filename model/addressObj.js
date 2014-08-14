var lodash = require("lodash");
var util = require('util');
var tools = require('../model/_tools');

// db.run("CREATE TABLE address (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, line1 TEXT, line2 TEXT, cp TEXT, city TEXT, country TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'address'); } });                        

var Address = function() {};

Address.prototype.insertUpdate = function(db, param, next, callback) {
    
    if (!param.notstring) tools.manageString(param);
    
    if (param.addressId && param.addressId > 0) {
        // existing (update)
        db.run("UPDATE address SET url = ?, line1 = ?, line2 = ?, cp = ?, city = ?, country = ? WHERE id = ?",
                [ param.addressURL, param.addressLine1, param.addressLine2, param.addressCP, param.addressCity, param.addressCountry, param.addressId ],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error update ADDRESS ' + util.inspect(err, false, null));
                        next(err);
                    }
                    else {
                        if (this.changes && this.changes > 0)    {
                            console.log("update ADDRESS OK (" + this.changes + ") : " + param.addressId);
                            callback({msg:"ok", addressId: param.addressId});
                        }
                        else {
                            console.log("update ADDRESS NOK");
                            callback({msg:"nok", addressId: 0});
                        }
                    }
                });
    } else {
        // new (insert)
        db.run("INSERT INTO address (url, line1, line2, cp, city, country) VALUES( ?, ?, ?, ?, ?, ?)",
                [ param.addressURL, param.addressLine1, param.addressLine2, param.addressCP, param.addressCity, param.addressCountry ],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error insert ADDRESS ' + util.inspect(err, false, null));
                        next(err);
                    }
                    else {
                        if (this.lastID)    {
                            console.log("insert ADDRESS OK : " + this.lastID);
                            callback({msg:"ok", addressId: this.lastID});
                        }
                        else {
                            console.log("insert ADDRESS NOK");
                            callback({msg:"nok", addressId: 0});
                        }
                    }
                });
    }
};

Address.prototype.findById = function(db, param, next, callback) {
    if (param.addressId && param.addressId > 0) {
        //console.log("** START find ADDRESS " + param.addressId);
        var addressObj = {};
        db.get("SELECT id, url, line1, line2, cp, city, country  FROM address WHERE id = ?", [param.addressId], function(err, row) {
            if(err) {
                console.log('SQL Error findAddress '  + util.inspect(err, false, null));
                next(err);
            }
            else {
                if (row)    {
                    lodash.assign( addressObj, {addressId: row.id, addressURL: row.url, addressLine1: row.line1, addressLine2: row.line2, addressCP: row.cp, addressCity: row.city, addressCountry: row.country });
                    callback(addressObj);
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
};

Address.prototype.delById = function(db, param, next, callback) {
    if (param.addressId && param.addressId > 0) {
        db.run("DELETE FROM Address WHERE id = ?",  [ param.addressId ], function(err, row) { 
            if (err) { 
                next(err); 
            } else callback(null);
        });
    } else callback(null);
};

module.exports = new Address();

var lodash = require("lodash");
var util = require('util');
var tools = require('../model/_tools');

// db.run("CREATE TABLE contact (id INTEGER PRIMARY KEY AUTOINCREMENT, tel TEXT, fax TEXT, mobile TEXT, mail TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'contact'); } });                        

var Contact = function() {};

Contact.prototype.insertUpdate = function(db, param, next, callback) {
    
    if (!param.notstring) tools.manageString(param);
    
    if (param.contactId && param.contactId > 0) {
        // existing (update)
        db.run("UPDATE contact SET tel = ?, fax = ?, mobile = ?, mail = ? WHERE id = ?",
                [ param.contactTel, param.contactFax, param.contactMobile, param.contactMail, param.contactId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error update CONTACT '+ util.inspect(err, false, null));
                       next(err);
                    }
                    else {
                        if (this.changes && this.changes > 0)    {
                            console.log("update CONTACT OK (" + this.changes + ") : " + param.contactId);
                            callback({msg:"ok", contactId : this.changes});
                        }
                        else {
                            console.log("update CONTACT NOK");
                            callback({msg:"nok", contactId: 0});
                        }
                    }
                });
    } else {
        // new (insert)
        db.run("INSERT INTO contact (tel, fax, mobile, mail) VALUES(?, ?, ?, ?)",
                [ param.contactTel, param.contactFax, param.contactMobile, param.contactMail],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error insert CONTACT '+ util.inspect(err, false, null));
                       next(err);
                    }
                    else {
                        if (this.lastID)    {
                            console.log("insert CONTACT OK : " + this.lastID);
                            callback({msg:"ok", contactId : this.lastID});
                        }
                        else {
                            console.log("insert CONTACT NOK");
                            callback({msg:"nok", contactId: 0});
                        }
                    }
                });
    }
};

Contact.prototype.findById = function( db, data, next, callback) {
    if (data.contactId && data.contactId > 0) {
        //console.log("** START find CONTACT " + data.contactId);
        var contactObj = {};
        db.get("SELECT id, tel, fax, mobile, mail  FROM contact WHERE id = ?", [data.contactId], function(err, row) {
            if(err) {
                console.log('SQL Error findContact '  + util.inspect(err, false, null));
                next(err);
            }
            else {
                if (row)    {
                    lodash.assign(contactObj, { contactId: row.id, contactTel: row.tel, contactFax: row.fax, contactMobile: row.mobile, contactMail: row.mail });
                    callback(contactObj);
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
};

module.exports = new Contact();

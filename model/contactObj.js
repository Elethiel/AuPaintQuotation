var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");

// db.run("CREATE TABLE contact (id INTEGER PRIMARY KEY AUTOINCREMENT, tel TEXT, fax TEXT, mobile TEXT, mail TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'contact'); } });

var Contact = function() {};

Contact.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    if (param.contactId && param.contactId > 0) {
        // existing (update)
        db.run("UPDATE contact SET tel = ?, fax = ?, mobile = ?, mail = ? WHERE id = ?",
            [ param.contactTel, param.contactFax, param.contactMobile, param.contactMail, param.contactId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", contactId : param.contactId});
                    else                                    callback(null, {msg:"nok", contactId: 0});
                }
            }
        ); // update
    } else {
        // new (insert)
        db.run("INSERT INTO contact (tel, fax, mobile, mail) VALUES(?, ?, ?, ?)",
            [ param.contactTel, param.contactFax, param.contactMobile, param.contactMail ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg:"ok", contactId : this.lastID});
                    else                callback(null, {msg:"nok", contactId: 0});
                }
            }
        ); // insert
    }
};

Contact.prototype.findById = function(db, param, callback) {
    if (param.contactId && param.contactId > 0) {
        //console.log("** START find CONTACT " + param.contactId);
        var contactObj = {};
        db.get("SELECT id, tel, fax, mobile, mail  FROM contact WHERE id = ?", [ param.contactId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    lodash.assign(contactObj, { contactId: row.id, contactTel: row.tel, contactFax: row.fax, contactMobile: row.mobile, contactMail: row.mail });
                    callback(null, contactObj);
                } else {
                    callback();
                }
            }
        });
    } else callback();
};

Contact.prototype.delById = function(db, param, callback) {
    if (param.contactId && param.contactId > 0) db.run("DELETE FROM Contact WHERE id = ?",  [ param.contactId ], function(err, row) { callback(err); } );
    else callback();
};

module.exports = new Contact();

var address = require("../model/addressObj");
var contact = require("../model/contactObj");
var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");
var async = require("async");

// db.run("CREATE TABLE company (id INTEGER PRIMARY KEY AUTOINCREMENT, legal TEXT, name TEXT, tva TEXT, siret TEXT, ape TEXT, address_id INT NOT NULL, contact_id INT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'company'); } });

var Company = function() {};

Company.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    // ensure ADDRESS and CONTACT
    // ensure company, get the id if exists
    db.get("SELECT address_id, contact_id FROM company WHERE id = ?",
        [ param.companyId ],
        function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {   param.addressId = row.address_id;
                                param.contactId = row.contact_id; }
                else        {   param.addressId = null;
                                param.contactId = null; }
                address.insertUpdate(db, {
                    addressId:          param.addressId ? param.addressId : param.companyAddressId,
                    addressURL:         param.addressURL ? param.addressURL : param.companyAddressURL,
                    addressLine1:       param.addressLine1 ? param.addressLine1 : param.companyAddressLine1,
                    addressLine2:       param.addressLine2 ? param.addressLine2 : param.companyAddressLine2,
                    addressCP:          param.addressCP ? param.addressCP : param.companyAddressCP,
                    addressCity:        param.addressCity ? param.addressCity : param.companyAddressCity,
                    addressCountry:     param.addressCountry ? param.addressCountry : param.companyAddressCountry },
                    function(err, ret) {
                        if (err) callback(err);
                        else {
                            var addressId = null;
                            if (ret.msg === "ok") addressId = ret.addressId;
                            // ensure contact for the company
                            contact.insertUpdate(db, {
                                contactId:          param.contactId ? param.contactId : param.companyContactId,
                                contactTel:         param.contactTel ? param.contactTel : param.companyContactTel,
                                contactFax:         param.contactFax ? param.contactFax : param.companyContactFax,
                                contactMobile:      param.contactMobile ? param.contactMobile : param.companyContactMobile,
                                contactMail:        param.contactMail ? param.contactMail : param.companyContactMail },
                                function(err, ret2) {
                                    if (err) callback(err);
                                    else {
                                        var contactId = null;
                                        if (ret2.msg === "ok") contactId = ret2.contactId;
                                        if (param.companyId && param.companyId > 0) {
                                            // existing (update)
                                            db.run("UPDATE company SET legal = ?, name = ?, tva = ?, siret = ?, ape = ?, address_id = ?, contact_id = ? WHERE id = ?",
                                                [ param.companyLegal, param.companyName, param.companyTVA, param.companySiret, param.companyAPE, addressId, contactId, param.companyId ],
                                                function(err, row) {
                                                    if (err) callback(err);
                                                    else {
                                                        if (this.changes && this.changes > 0)   callback(null, {msg:"ok", companyId : param.companyId});
                                                        else                                  callback(null, {msg:"nok", companyId: 0});
                                                    }
                                                }
                                            ); // update
                                        } else {
                                            // new (insert)
                                            db.run("INSERT INTO company (legal, name, tva, siret, ape, address_id, contact_id) VALUES(?, ?, ?, ?, ?, ?, ?)",
                                                [ param.companyLegal, param.companyName, param.companyTVA, param.companySiret, param.companyAPE, addressId, contactId ],
                                                function(err, row) {
                                                    if (err) callback(err);
                                                    else {
                                                        if (this.lastID)    callback(null, {msg:"ok", companyId : this.lastID});
                                                        else                callback(null, {msg:"nok", companyId: 0});
                                                    }
                                                }
                                            ); // insert callback
                                        }
                                    }
                                }
                            ); // contact callback
                        }
                    }
                ); // address callback
            }
        }
    ); // select callback
};

Company.prototype.findById = function(db, param, callback) {
    if (param.companyId && param.companyId > 0) {
        //console.log("** START find COMPANY " + param.companyId);
        var companyObj = {};
        db.get("SELECT id, legal, name, tva, siret, ape, address_id, contact_id  FROM company WHERE id = ?", [ param.companyId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    // fill the contact object now
                    contact.findById(db, {contactId: row.contact_id}, function(err, contactObj) {
                        if (err) callback(err);
                        else {
                            // fill the adress object now
                            address.findById(db, {addressId: row.address_id}, function(err, addressObj) {
                                if (err) callback(err);
                                else {
                                    lodash.assign(companyObj, {companyId: row.id, contactObj: contactObj, addressObj: addressObj, companyLegal: row.legal, companyName: row.name, companyTVA: row.tva, companySiret: row.siret, companyAPE: row.ape });
                                    callback(null, companyObj);
                                }
                            }); // address
                        }
                    }); // contact
                } else callback();
            }
        }); // select
    } else callback();
};

Company.prototype.getFlatVersion = function(companyObj) {
    if (companyObj) {
        lodash.assign(companyObj, companyObj.addressObj);
        lodash.assign(companyObj, companyObj.contactObj);
        delete companyObj.addressObj;
        delete companyObj.contactObj;

    }
    return companyObj;
};

Company.prototype.getFlatVersionX = function(companyObj) {
    if (companyObj) {
        lodash.assign(companyObj, { companyAddressId: companyObj.addressObj.addressId, companyAddressURL: companyObj.addressObj.addressURL, companyAddressLine1: companyObj.addressObj.addressLine1, companyAddressLine2: companyObj.addressObj.addressLine2, companyAddressCP: companyObj.addressObj.addressCP, companyAddressCity: companyObj.addressObj.addressCity, companyAddressCountry: companyObj.addressObj.addressCountry });
        lodash.assign(companyObj, { companyContactId: companyObj.contactObj.contactId, companyContactTel: companyObj.contactObj.contactTel, companyContactFax: companyObj.contactObj.contactFax, companyContactMobile: companyObj.contactObj.contactMobile, companyContactMail: companyObj.contactObj.contactMail });
        delete companyObj.addressObj;
        delete companyObj.contactObj;

    }
    return companyObj;
};

Company.prototype.delById = function(db, param, callback) {
    if (param.companyId && param.companyId > 0) {
        db.get("SELECT contact_id, address_id FROM Company WHERE id = ?", [ param.companyId ], function(err, row) {
            if (err || !row) callback(err);
            else {
                async.series( [
                    function(c) {  contact.delById(db, { contactId: row.contact_id }, function(err) { c(err); } ) } ,
                    function(c) {  address.delById(db, { addressId: row.address_id }, function(err) { c(err); } ) } ,
                    function(c) {  db.run("DELETE FROM Company WHERE id = ?",  [ param.companyId ], function(err, row) { c(err); } ); }
                ], function(err) { callback(err); } );
            }
        });
    }
};

Company.prototype.delByCustomerId = function(db, param, callback) {
    if (param.customerId && param.customerId > 0) {
        // existing
        var self = this;
        db.get("SELECT company_id FROM customer WHERE id = ?", [ param.customerId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row) self.delById(db, { companyId: row.company_id }, function(err, row) { if (err) callback(err); } );
                callback(); // deleted
            }
        });
    } else callback(); // nothing to delete
};

module.exports = new Company();

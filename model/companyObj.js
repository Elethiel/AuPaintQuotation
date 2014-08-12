var address = require("../model/addressObj");
var contact = require("../model/contactObj");
var lodash = require("lodash");
var util = require('util');
var tools = require('../model/_tools');

// db.run("CREATE TABLE company (id INTEGER PRIMARY KEY AUTOINCREMENT, legal TEXT, name TEXT, tva TEXT, siret TEXT, ape TEXT, address_id INT NOT NULL, contact_id INT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'company'); } });

var Company = function() {};

Company.prototype.insertUpdate = function(db, param, next, callback) {

    if (!param.notstring) tools.manageString(param);

    // ensure ADDRESS and CONTACT
    // ensure company, get the id if exists
    db.get("SELECT address_id, contact_id FROM company WHERE id = ?",
            [param.companyId],
            function(err, row) {
                if(err) {
                    console.log('SQL Error insertUpdate '  + util.inspect(err, false, null));
                    next(err);
                }
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
                            next,
                            function(ret) {
                                var addressId = null;
                                if (ret.msg === "ok") {
                                    var addressId = ret.addressId;
                                }
                                // ensure contact for the company
                                contact.insertUpdate(db, {
                                        contactId:          param.contactId ? param.contactId : param.companyContactId,
                                        contactTel:         param.contactTel ? param.contactTel : param.companyContactTel,
                                        contactFax:         param.contactFax ? param.contactFax : param.companyContactFax,
                                        contactMobile:      param.contactMobile ? param.contactMobile : param.companyContactMobile,
                                        contactMail:        param.contactMail ? param.contactMail : param.companyContactMail },
                                        next,
                                        function(ret2) {
                                            var contactId = null;
                                            if (ret2.msg === "ok") {
                                                var contactId = ret2.contactId;
                                            }
                                            if (param.companyId && param.companyId > 0) {
                                                // existing (update)
                                                db.run("UPDATE company SET legal = ?, name = ?, tva = ?, siret = ?, ape = ?, address_id = ?, contact_id = ? WHERE id = ?",
                                                        [ param.companyLegal, param.companyName, param.companyTVA, param.companySiret, param.companyAPE, addressId, contactId, param.companyId],
                                                        function(err, row) {
                                                            if(err) {
                                                                console.log('SQL Error update COMPANY ' + util.inspect(err, false, null));
                                                                next(err);
                                                            }
                                                            else {
                                                                if (this.changes && this.changes > 0)    {
                                                                    console.log("update COMPANY OK (" + this.changes + ") : " + param.companyId);
                                                                    callback({msg:"ok", companyId : param.companyId});
                                                                }
                                                                else {
                                                                    console.log("update COMPANY NOK");
                                                                    callback({msg:"nok", companyId: 0});
                                                                }
                                                            }
                                                        });
                                            } else {
                                                // new (insert)
                                                db.run("INSERT INTO company (legal, name, tva, siret, ape, address_id, contact_id) VALUES(?, ?, ?, ?, ?, ?, ?)",
                                                        [ param.companyLegal, param.companyName, param.companyTVA, param.companySiret, param.companyAPE, addressId, contactId],
                                                        function(err, row) {
                                                            if(err) {
                                                                console.log('SQL Error insert COMPANY ' + util.inspect(err, false, null));
                                                                next(err);
                                                            }
                                                            else {
                                                                if (this.lastID)    {
                                                                    console.log("insert COMPANY OK : " + this.lastID);
                                                                    callback({msg:"ok", companyId : this.lastID});
                                                                }
                                                                else {
                                                                    console.log("insert COMPANY NOK");
                                                                    callback({msg:"nok", companyId: 0});
                                                                }
                                                            }
                                                        }); // insert callback
                                            }
                                        }); // contact callback
                        }); // address callback
                }
            }); // select callback
};

Company.prototype.findById = function(db, data, next, callback) {
    if (data.companyId && data.companyId > 0) {
        //console.log("** START find COMPANY " + data.companyId);
        var companyObj = {};
        db.get("SELECT id, legal, name, tva, siret, ape, address_id, contact_id  FROM company WHERE id = ?", [data.companyId], function(err, row) {
            if(err) {
                console.log('SQL Error findCompany '  + util.inspect(err, false, null));
                next(err);
            }
            else {
                if (row)    {
                    // fill the contact object now
                    contact.findById(db, {contactId: row.contact_id}, next, function(contactObj) {
                        // fill the adress object now
                        address.findById(db, {addressId: row.address_id}, next, function(addressObj) {
                            lodash.assign(companyObj, {companyId: row.id, contactObj: contactObj, addressObj: addressObj, companyLegal: row.legal, companyName: row.name, companyTVA: row.tva, companySiret: row.siret, companyAPE: row.ape });
                            callback(companyObj);
                        });
                    });
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
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
        lodash.assign(companyObj, { companyContactId: companyObj.contactObj.contactId, companycontactTel: companyObj.contactObj.contactTel, companycontactFax: companyObj.contactObj.contactFax, companycontactMobile: companyObj.contactObj.contactMobile, companycontactMail: companyObj.contactObj.contactMail });
        delete companyObj.addressObj;
        delete companyObj.contactObj;

    }
    return companyObj;
};

Company.prototype.delByCustomerId = function(db, param, next, callback) {
    if (param.customerId && param.customerId > 0) {
        // existing
        db.get("SELECT company_id FROM customer WHERE customer_id = ?", [ param.customerId ], function(err, row) {
            if(err) {
                console.log('SQL Error delete CompanyByCustomerId '+ util.inspect(err, false, null));
                next(err);
            } else {
                if (row) {
                    console.log("Delete Company id = " + row.company_id);
                    db.run("DELETE FROM Company WHERE id = ?",  [ row.company_id ], function(err, row) { if (err) next(err); } );
                    callback(); // deleted
                } else callback(); // no company to delete
            }
        });
    } else callback(); // nothing to delete
};

module.exports = new Company();

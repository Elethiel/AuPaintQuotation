var address = require("../model/addressObj");
var contact = require("../model/contactObj");
var lodash = require("lodash");
var util = require('util');
var async = require('async');
var tools = require('../model/_tools');

// db.run("CREATE TABLE person (id INTEGER PRIMARY KEY AUTOINCREMENT, gender char(2), firstname TEXT, lastname TEXT, address_id INT NOT NULL, contact_id INT NOT NULL, note TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'person'); } });

var Person = function() {};

Person.prototype.insertUpdate = function(db, param, next, callback) {

    if (!param.notstring) tools.manageString(param);

    // ensure ADDRESS and CONTACT
    // ensure person, get the id if exists
    db.get("SELECT address_id, contact_id FROM person WHERE id = ?",
            [param.personId],
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
                            addressId:          param.addressId ? param.addressId : param.personAddressId,
                            addressURL:         param.addressURL ? param.addressURL : param.personAddressURL,
                            addressLine1:       param.addressLine1 ? param.addressLine1 : param.personAddressLine1,
                            addressLine2:       param.addressLine2 ? param.addressLine2 : param.personAddressLine2,
                            addressCP:          param.addressCP ? param.addressCP : param.personAddressCP,
                            addressCity:        param.addressCity ? param.addressCity : param.personAddressCity,
                            addressCountry:     param.addressCountry ? param.addressCountry : param.personAddressCountry },
                            next,
                            function(ret) {
                                var addressId = null;
                                if (ret.msg === "ok") {
                                    addressId = ret.addressId;
                                }
                                // ensure contact for the person
                                contact.insertUpdate(db, {
                                        contactId:          param.contactId ? param.contactId : param.personContactId,
                                        contactTel:         param.contactTel ? param.contactTel : param.personContactTel,
                                        contactFax:         param.contactFax ? param.contactFax : param.personContactFax,
                                        contactMobile:      param.contactMobile ? param.contactMobile : param.personContactMobile,
                                        contactMail:        param.contactMail ? param.contactMail : param.personContactMail },
                                        next,
                                        function(ret2) {
                                            var contactId = null;
                                            if (ret2.msg === "ok") {
                                                contactId = ret2.contactId;
                                            }
                                            if (param.personId && param.personId > 0) {
                                                // existing (update)
                                                db.run("UPDATE person SET gender = ?, firstname = ?, lastname = ?, note = ?, address_id = ?, contact_id = ? WHERE id = ?",
                                                        [ param.personGender, param.personFirstname, param.personLastname, param.personNote, addressId, contactId, param.personId],
                                                        function(err, row) {
                                                            if(err) {
                                                                console.log('SQL Error update PERSON ' + util.inspect(err, false, null));
                                                                next(err);
                                                            }
                                                            else {
                                                                if (this.changes && this.changes > 0)    {
                                                                    console.log("update PERSON OK (" + this.changes + ") : " + param.personId);
                                                                    callback({msg:"ok", personId : param.personId});
                                                                }
                                                                else {
                                                                    console.log("update PERSON NOK");
                                                                    callback({msg:"nok", personId: 0});
                                                                }
                                                            }
                                                        });
                                            } else {
                                                // new (insert)
                                                db.run("INSERT INTO person (gender, firstname, lastname, note, address_id, contact_id) VALUES(?, ?, ?, ?, ?, ?)",
                                                        [ param.personGender, param.personFirstname, param.personLastname, param.personNote, addressId, contactId ],
                                                        function(err, row) {
                                                            if(err) {
                                                                console.log('SQL Error insert PERSON ' + util.inspect(err, false, null));
                                                                next(err);
                                                            }
                                                            else {
                                                                if (this.lastID)    {
                                                                    console.log("insert PERSON OK : " + this.lastID);
                                                                    callback({msg:"ok", personId : this.lastID});
                                                                }
                                                                else {
                                                                    console.log("insert PERSON NOK");
                                                                    callback({msg:"nok", personId: 0});
                                                                }
                                                            }
                                                        }); // insert callback
                                            }
                                        }); // contact callback
                            }); // address callback
                }
            }); // select callback
};

Person.prototype.findById = function(db, param, next, callback) {
    if (param.personId && param.personId > 0) {
        //console.log("** START find PERSON " + data.personId);
        var personObj = {};
        db.get("SELECT id, gender, firstname, lastname, note, address_id, contact_id  FROM person WHERE id = ?", [param.personId], function(err, row) {
            if(err) {
                console.log('SQL Error findPerson '  + util.inspect(err, false, null));
                next(err);
            }
            else {
                if (row)    {
                    // fill the contact object now
                    contact.findById(db, { contactId: row.contact_id}, next, function(contactObj) {
                        // fill the adress object now
                        address.findById(db, { addressId: row.address_id}, next, function(addressObj) {
                            lodash.assign(personObj, { personId: row.id, contactObj: contactObj, addressObj: addressObj, personGender: row.gender, personFirstname: row.firstname, personLastname: row.lastname, personNote: row.note });
                            callback(personObj);
                        });
                    });
                } else {
                    callback(null);
                }
            }
        });
    } else {
        //console.log("no id for person");
        callback(null);
    }
};

Person.prototype.getFlatVersion = function(personObj) {
    if (personObj) {
        lodash.assign(personObj, personObj.addressObj);
        lodash.assign(personObj, personObj.contactObj);
        delete personObj.addressObj;
        delete personObj.contactObj;

    }
    return personObj;
}

Person.prototype.getFlatVersionX = function(personObj) {
    if (personObj) {
        lodash.assign(personObj, { personAddressId: personObj.addressObj.addressId, personAddressURL: personObj.addressObj.addressURL, personAddressLine1: personObj.addressObj.addressLine1, personAddressLine2: personObj.addressObj.addressLine2, personAddressCP: personObj.addressObj.addressCP, personAddressCity: personObj.addressObj.addressCity, personAddressCountry: personObj.addressObj.addressCountry });
        lodash.assign(personObj, { personContactId: personObj.contactObj.contactId, personContactTel: personObj.contactObj.contactTel, personContactFax: personObj.contactObj.contactFax, personContactMobile: personObj.contactObj.contactMobile, personContactMail: personObj.contactObj.contactMail });
        delete personObj.addressObj;
        delete personObj.contactObj;

    }
    return personObj;
}

Person.prototype.findAllByCustomerId = function(db, param, next, callback) {
    var personList = [];
    db.all("SELECT person_id FROM customer_person WHERE customer_id = ?", [ param.customerId ], function(err, rows) {
        if(err) {
            console.log('SQL Error Person findAllByCustomerId '  + util.inspect(err, false, null));
            next(err);
        } else {
            if (rows) {
                async.series( [ function(c) {
                    rows.forEach(function(row) {
                        findById(db, { personId: row.person_id }, next, function(personObj) {
                            personList.push(productObj);
                        });
                    });
                    c();
                }]  );
            }
            //console.log("return personList nb=" + personList.length);
            callback(personList);
        }
    });
};

Person.prototype.delById = function(db, param, next, callback) {
    if (param.personId && param.personId > 0) {
        db.get("SELECT contact_id, address_id FROM person WHERE id = ?", [ param.personId ], function(err, row) {
            if(err) {
                console.log('SQL Error delete PersonById '+ util.inspect(err, false, null));
                next(err);
            } else {
                if (row) {
                    async.series( [
                        function(c) {  contact.delById(db, { contactId: row.contact_id }, next, function(err) { if (err) { console.log("delete Contact from Person"); next(err); } else c(); } ) } ,
                        function(c) {  address.delById(db, { addressId: row.address_id }, next, function(err) { if (err) { console.log("delete Address from Person"); next(err); } else c(); } ) } ,
                        function(c) {  db.run("DELETE FROM Person WHERE id = ?",  [ param.personId ], function(err, row) { if (err) { console.log("delete Person by Id " + param.personId); next(err); } else c(); } ); }
                    ] );
                }
                callback();
            }
        });
    }
};

Person.prototype.delByCustomerId = function(db, param, next, callback) {
    if (param.customerId && param.customerId > 0) {
        // existing
        var self = this;
        db.all("SELECT person_id FROM customer_person WHERE customer_id = ?", [ param.customerId ], function(err, rows) {
            if(err) {
                console.log('SQL Error delete PersonByCustomerId '+ util.inspect(err, false, null));
                next(err);
            } else {
                async.series( [
                    function(c) {
                        if (rows) {
                            rows.forEach(function(row) {
                                self.delById(db, { personId: row.person_id }, next, function(err, row) { if (err) { console.log("Delete Person By CId"); next(err); } } );
                            });
                        }
                        c();
                    },
                    function(c) {
                        db.get("SELECT person_id FROM customer WHERE id = ?", [ param.customerId ], function(err, row) {
                            if(err) {
                                console.log('SQL Error delete Person2ByCustomerId '+ util.inspect(err, false, null));
                                next(err);
                            } else {
                                if (row) {
                                    self.delById(db, { personId: row.person_id }, next, function(err, row) { if (err) { console.log("Delete Person By CId 2"); next(err); } } );
                                }
                                c();
                            }
                        });
                    }
                ]  );
                callback(); // deleted
            }
        });
    } else callback(); // nothing to delete
};

module.exports = new Person();

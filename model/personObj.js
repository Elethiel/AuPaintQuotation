var address = require("../model/addressObj");
var contact = require("../model/contactObj");
var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");
var async = require("async");

// db.run("CREATE TABLE person (id INTEGER PRIMARY KEY AUTOINCREMENT, gender char(2), firstname TEXT, lastname TEXT, address_id INT NOT NULL, contact_id INT NOT NULL, note TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'person'); } });

var Person = function() {};

Person.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    // ensure ADDRESS and CONTACT
    // ensure person, get the id if exists
    db.get("SELECT address_id, contact_id FROM person WHERE id = ?",
        [ param.personId ],
        function(err, row) {
            if (err) callback(err);
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
                    function(err, ret) {
                        if (err) callback(err);
                        else {
                            var addressId = null;
                            if (ret.msg === "ok")  addressId = ret.addressId;

                            // ensure contact for the person
                            contact.insertUpdate(db, {
                                contactId:          param.contactId ? param.contactId : param.personContactId,
                                contactTel:         param.contactTel ? param.contactTel : param.personContactTel,
                                contactFax:         param.contactFax ? param.contactFax : param.personContactFax,
                                contactMobile:      param.contactMobile ? param.contactMobile : param.personContactMobile,
                                contactMail:        param.contactMail ? param.contactMail : param.personContactMail },
                                function(err, ret2) {
                                    if (err) callback(err);
                                    else {
                                        var contactId = null;
                                        if (ret2.msg === "ok")  contactId = ret2.contactId;
                                        if (param.personId && param.personId > 0) {
                                            // existing (update)
                                            db.run("UPDATE person SET gender = ?, firstname = ?, lastname = ?, note = ?, address_id = ?, contact_id = ? WHERE id = ?",
                                                [ param.personGender, param.personFirstname, param.personLastname, param.personNote, addressId, contactId, param.personId ],
                                                function(err, row) {
                                                    if (err) callback(err);
                                                    else {
                                                        if (this.changes && this.changes > 0)   callback(null, {msg:"ok", personId : param.personId});
                                                        else                                    callback(null, {msg:"nok", personId: 0});
                                                    }
                                                }
                                            );
                                        } else {
                                            // new (insert)
                                            db.run("INSERT INTO person (gender, firstname, lastname, note, address_id, contact_id) VALUES(?, ?, ?, ?, ?, ?)",
                                                [ param.personGender, param.personFirstname, param.personLastname, param.personNote, addressId, contactId ],
                                                function(err, row) {
                                                    if (err) callback(err);
                                                    else {
                                                        if (this.lastID)    callback(null, {msg:"ok", personId : this.lastID});
                                                        else                callback(null, {msg:"nok", personId: 0});
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

Person.prototype.findById = function(db, param, callback) {
    if (param.personId && param.personId > 0) {
        //console.log("** START find PERSON " + param.personId);
        var personObj = {};
        db.get("SELECT id, gender, firstname, lastname, note, address_id, contact_id  FROM person WHERE id = ?", [ param.personId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    // fill the contact object now
                    contact.findById(db, { contactId: row.contact_id}, function(err, contactObj) {
                        if (err) callback(err);
                        else {
                            // fill the adress object now
                            address.findById(db, { addressId: row.address_id}, function(err, addressObj) {
                                if (err) callback(err);
                                else {
                                    lodash.assign(personObj, { personId: row.id, contactObj: contactObj, addressObj: addressObj, personGender: row.gender, personFirstname: row.firstname, personLastname: row.lastname, personNote: row.note });
                                    callback(null, personObj);
                                }
                            });
                        }
                    });
                } else callback();
            }
        });
    } else callback();
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
        if (personObj.addressObj) lodash.assign(personObj, { personAddressId: personObj.addressObj.addressId, personAddressURL: personObj.addressObj.addressURL, personAddressLine1: personObj.addressObj.addressLine1, personAddressLine2: personObj.addressObj.addressLine2, personAddressCP: personObj.addressObj.addressCP, personAddressCity: personObj.addressObj.addressCity, personAddressCountry: personObj.addressObj.addressCountry });
        if (personObj.contactObj) lodash.assign(personObj, { personContactId: personObj.contactObj.contactId, personContactTel: personObj.contactObj.contactTel, personContactFax: personObj.contactObj.contactFax, personContactMobile: personObj.contactObj.contactMobile, personContactMail: personObj.contactObj.contactMail });
        delete personObj.addressObj;
        delete personObj.contactObj;

    }
    return personObj;
}

Person.prototype.findAllByCustomerId = function(db, param, callback) {
    var self = this;
    db.all("SELECT person_id FROM customer_person WHERE customer_id = ?", [ param.customerId ], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows) {
                var seriesFns = [];
                rows.forEach(function(row) {
                    seriesFns.push(function(c) {
                        self.findById(db, { personId: row.person_id }, function(err, personObj) {
                            c(err, self.getFlatVersionX(personObj));
                        });
                    });
                });
                async.series(seriesFns,
                    function(err, personList) {
                        if (err) callback(err, []);
                        else callback(null, personList);
                    }
                );
            } else callback(null, []);
        }
    });
};

Person.prototype.delById = function(db, param, callback) {
    if (param.personId && param.personId > 0) {
        db.get("SELECT contact_id, address_id FROM person WHERE id = ?", [ param.personId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row) {
                    async.series( [
                        function(c) {  contact.delById(db, { contactId: row.contact_id }, function(err) { c(err); } ) } ,
                        function(c) {  address.delById(db, { addressId: row.address_id }, function(err) { c(err); } ) } ,
                        function(c) {  db.run("DELETE FROM Person WHERE id = ?",  [ param.personId ], function(err, row) { c(err); } ); }
                    ], function(err) {
                        if (err) callback(err);
                        else callback();
                    });
                } else callback();
            }
        });
    }
};

Person.prototype.delByCustomerId = function(db, param, callback) {
    if (param.customerId && param.customerId > 0) {
        // existing
        var self = this;
        db.all("SELECT person_id FROM customer_person WHERE customer_id = ?", [ param.customerId ], function(err, rows) {
            if (err) callback(err);
            else {
                if (rows) {
                    var seriesFns = [];
                    rows.forEach(function(row) {
                        seriesFns.push(function(c) {
                            self.delById(db, { personId: row.person_id }, function(err, row) {
                                c(err, row);
                            });
                        });
                        seriesFns.push(function(c) {
                            db.run("DELETE FROM customer_person WHERE customer_id = ? AND person_id = ?", [ param.customerId, row.personId ], function(err, rows) {
                                c(err, row);
                            });
                        });
                    });
                    async.series(
                        seriesFns,
                        function(err, rows) {
                            if (err) callback(err);
                            else {
                                db.get("SELECT person_id FROM customer WHERE id = ?", [ param.customerId ], function(err, row) {
                                    if (err) callback(err);
                                    else {
                                        if (row) self.delById(db, { personId: row.person_id }, function(err, row) { callback(err); } );
                                        else callback();
                                    }
                                });
                            }
                        }
                    );
                } else callback();
            }
        });
    } else callback(); // nothing to delete
};


Person.prototype.delByCustomerIdAndId = function(db, param, callback) {
    if (param.customerId && param.customerId > 0 && param.personId && param.personId > 0) {
        // existing
        var self = this;
        db.run("DELETE FROM customer_person WHERE customer_id = ? AND person_id = ?", [ param.customerId, param.personId ], function(err, rows) {
            if (err) callback(err);
            else {
                self.delById(db, { personId: param.personId }, function(err, row) {
                    if (err) callback(err, {msg: "nok"});
                    else callback(null, {msg: "ok"});
                });
            }
        });
    } else callback(null, {msg: "ok"}); // nothing to delete
};

Person.prototype.linkToCustomer = function(db, param, callback) {
    if (param.customerId && param.customerId > 0) {
        // existing
        var self = this;
        db.run("INSERT INTO customer_person (person_id, customer_id) VALUES(?, ?)",
            [ param.personId, param.customerId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg: "ok"}); // don't care about the id
                    else callback(null, {msg: "nok"});
                }
            }
        );
    }
};

module.exports = new Person();

var company = require('../model/companyObj');
var person = require('../model/personObj');
var lodash = require("lodash");
var util = require('util');
var tools = require('../model/_tools');

// db.run("CREATE TABLE customer (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT, type BOOLEAN, company_id INT, person_id INT, note TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'customer'); } });

var Customer = function() {};

Customer.prototype.insertUpdate = function(db, param, next, callback) {
    var objType = null;
    var objParam = [];
    
    if (!param.notstring) tools.manageString(param);
    
    // check companyId, personId
    db.get("SELECT company_id, person_id FROM Customer WHERE id = ?", 
            [ param.customerId ], 
            function(err, row) {
                if(err) {
                    console.log('SQL Error insertUpdate '  + util.inspect(err, false, null));
                    next(err);
                }
                else {
                    if (row)    {   param.companyId = row.company_id; 
                                    param.personId = row.person_id; }
                    else        {   param.companyId = null; 
                                    param.personId = null; }
                    // main component (company or person for main contact of the customer)
                    company.insertUpdate(db, param, next,
                        function(ret) {
                            if (ret.msg === "ok") { // optional
                                param.companyId = ret.companyId;
                            } else param.companyId = null;

                            person.insertUpdate(db, param, next,
                                function(ret2) {
                                    if (ret2.msg === "ok") {
                                        param.personId = ret2.personId;
                                        if (param.customerId && param.customerId > 0) {
                                            // existing (update)
                                            
                                            db.run("UPDATE Customer SET status = ?, type = ?, note = ?, company_id = ?, person_id = ? WHERE id = ?",
                                                [ param.customerStatus, param.customerType, param.customerNote, param.companyId, param.personId, param.customerId ],
                                                function (err, row) {
                                                    if(err) {
                                                        console.log("SQL Error update Customer " + util.inspect(err, false, null));
                                                        next(err);
                                                    } else {
                                                        if (this.changes && this.changes > 0)    {
                                                            console.log("update Customer OK (" + this.changes + ") : " + param.customerId);
                                                            callback({msg:"ok", customerId : this.changes});
                                                        } else {
                                                            console.log("update Customer NOK");
                                                            callback({msg:"nok", customerId: 0});
                                                        }
                                                    }
                                                });
                                        } else {
                                            // new (insert)
                                            db.run("INSERT INTO Customer (status, type, note, company_id, person_id) VALUES (?, ?, ?, ?, ?)",
                                                [ param.customerStatus, param.customerType, param.customerNote, param.companyId, param.personId ],
                                                function(err, row) {
                                                    if(err) {
                                                        console.log('SQL Error insert Customer '+ util.inspect(err, false, null));
                                                       next(err);
                                                    } else {
                                                        if (this.lastID)    {
                                                            console.log("insert Customer OK : " + this.lastID);
                                                            callback({msg:"ok", customerId : this.lastID});
                                                        } else {
                                                            console.log("insert Customer NOK");
                                                            callback({msg:"nok", customerId: 0});
                                                        }
                                                    }
                                                });
                                        }
                                    
                                } else {
                                    callback({msg:"nok", customerId: -2}); // error on person
                                }
                                }); // update person
                        }); // update company
                }
            }); // select company and person
};

Customer.prototype.findById = function( db, data, next, callback) {
    if (data.customerId && data.customerId > 0) {
        console.log("** START find Customer " + data.customerId);
        var customerObj = {};
        db.get("SELECT id, status as customerStatus, type, note, company_id FROM Customer WHERE id = ?", [data.customerId], function(err, row) {
            if(err) {
                console.log('SQL Error findCustomer '  + util.inspect(err, false, null));
                next(err);
            } else {
                if (row)    {
                    // fill the company object now
                    company.findById(db, { companyId: row.company_id }, next, function(companyObj) {
                        // fill the person object now
                        person.findById(db, { personId: row.person_id }, next, function(personObj) {
                            person.findAllByCustomerId(db, { customerId: row.id }, next, function(personList) {
                                lodash.assign(customerObj, { customerId: row.id, customerStatus: row.customerStatus, customerType: row.type, companyObj: companyObj, personObj: personObj, personList: personList });
                                //console.log("** find Customer " + util.inspect(customerObj, false, null));
                                callback(customerObj);
                            });
                        });
                    });
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
};

Customer.prototype.getFlatVersion = function(customerObj) {
    if (customerObj) { // flat not possible for personList
        lodash.assign(customerObj, company.getFlatVersionX(customerObj.companyObj));
        lodash.assign(customerObj, person.getFlatVersionX(customerObj.personObj));
        delete customerObj.companyObj;
        delete customerObj.personObj;

    }
    return customerObj;
}

Customer.prototype.findAll = function( db, next, callback) {
    var customerList = [];
    db.all("SELECT c.id, c.type, cp.name, p.firstname, p.lastname FROM Customer as c LEFT JOIN company as cp ON (cp.id = c.company_id) LEFT JOIN person as p ON (p.id = c.person_id)", [], function(err, rows) {
        if(err) {
            console.log('SQL Error findAllCustomer '  + util.inspect(err, false, null));
            next(err);
        } else {
            if (rows)    {
                rows.forEach(function(row) {
                    var customerObj = {};
                    lodash.assign(customerObj, { customerId: row.id, customerType: row.type, companyName: row.name, personFirstname: row.firstname, personLastname: row.lastname });
                    customerList.push(customerObj);
                });
            }

            callback(customerList);
        }
    });
};

Customer.prototype.delById = function(db, param, next, callback) {
    if (param.customerId && param.customerId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM invoice WHERE customer_id = ?",
                [ param.TVAId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error delete Customer check relation '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (row && row.nb > 0) {
                            console.log("Functional Error Customer : already used by " + row.nb + " Invoices");
                            callback({msg:"rej", CustomerNb : row.nb});
                        } else {
                            // 1. delete all persons linked to customer
                            person.delByCustomerId(db, param, next, function() {
                                // 2. delete the company linked to customer
                                company.delByCustomerId(db, param, next, function() {
                                    // 3. delete the customer itself
                                    db.run("DELETE FROM customer WHERE id = ?",
                                        [ param.customerId],
                                        function (err, row) {
                                            if(err) {
                                                console.log('SQL Error delete customer '+ util.inspect(err, false, null));
                                               next(err);
                                            } else {
                                                if (this.changes && this.changes > 0)    {
                                                    console.log("delete Customer OK (" + this.changes + ") : " + param.customerId);
                                                    callback({msg:"ok", customerId : this.changes});
                                                } else {
                                                    console.log("delete Customer NOK");
                                                    callback({msg:"nok", customerId: 0});
                                                }
                                            }
                                        });
                                });
                            });
                        }
                    }
                });
        
    } else callback({msg:"nok", customerId: 0});
};

module.exports = new Customer();

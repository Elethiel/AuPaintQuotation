var company = require("../model/companyObj");
var tools = require("../model/_tools");
var util = require("util");
var lodash = require("lodash");


// db.run("CREATE TABLE owner (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INT, fiscalDt INT, defaultValidity INT, logo TEXT, bigLogo TEXT, factorok REAL, factornull REAL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'owner'); } });

var Owner = function() {};

Owner.prototype.isOwnerExist = function(db, callback) {
    // request to find is owner already exist
    db.get("SELECT id FROM owner ", [], function(err, row) {
        if (err) callback(err);
        else {
            if (row)    callback(null, {msg:"ok", ownerid: row.id});
            else        callback(null, {msg:"nok",ownerid: 0});
        }
    });
};

Owner.prototype.insertUpdate = function(db, param, callback) {
    
    if (!param.notstring) tools.manageString(param);
    
    //console.log("** START insertUpdate OWNER");
    
    param.addressCountry = "France";
    // ensure company of the owner, get the id if exists
    db.get("SELECT company_id FROM owner WHERE id = ?", 
        [ param.ownerId ], 
        function(err, row) {
            if (err) callback(err);
            else {
                if (row)    { param.companyId = row.company_id; }
                else        { param.companyId = null; }
                company.insertUpdate(db, param, function(err, ret) {
                    if (err) callback(err);
                    else {
                        if (ret.msg === "ok") {
                            var companyId = ret.companyId;
                            // ensure Owner itself
                            if (param.ownerId && param.ownerId > 0) {
                                // existing (update)
                                db.run("UPDATE owner SET company_id = ?, fiscalDt = ?, defaultValidity = ?, logo = ?, bigLogo = ?, factorok = ?, factornull = ? WHERE id = ?",
                                    [ companyId, param.ownerFiscalDt, param.ownerDefaultValidity, param.ownerLogo, param.ownerBigLogo, param.ownerFactorOk, param.ownerFactorNull, param.ownerId ],
                                    function(err, row) {
                                        if (err) callback(err);
                                        else {
                                            if (this.changes && this.changes > 0)   callback(null, {msg:"ok", ownerId : param.ownerId});
                                            else                                    callback(null, {msg:"nok", ownerId: 0});
                                        }
                                    }
                                ); // update callback
                            } else {
                                // new (insert)
                                db.run("INSERT INTO owner (company_id, fiscalDt, defaultValidity, logo, bigLogo, factorok, factornull) VALUES(?, ?, ?, ?, ?, ?, ?)",
                                    [ companyId, param.ownerFiscalDt, param.ownerDefaultValidity, param.ownerLogo, param.ownerBigLogo, param.ownerFactorOk, param.ownerFactorNull ],
                                    function(err, row) {
                                        if (err) callback(err);
                                        else {
                                            if (this.lastID)    callback(null, {msg:"ok", ownerId : this.lastID});
                                            else                callback(null, {msg:"nok", ownerId: 0});
                                        }
                                    }
                                ); // insert callback
                            }
                        } else callback(null, {msg:"nok", ownerId: -3});
                    }
                }); // company callback
            }
        }
    ); // select callback
};

Owner.prototype.findById = function(db, param, callback) {
    if (param && param.ownerId && param.ownerId > 0) {
        //console.log("** START find OWNER " + param.ownerId);
        
        var ownerObj = {};
        db.get("SELECT id, company_id, fiscalDt, defaultValidity, logo, bigLogo, factorok, factornull FROM owner WHERE id = ?", [ param.ownerId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row) {
                    // fill the company object now
                    company.findById(db, {companyId: row.company_id}, function(err, companyObj) {
                        if (err) callback(err);
                        else {
                            var ownerRender = companyObj.companyName.replace("<", "&amp;lt;").replace(">", "&amp;gt;").replace("\"", "'").replace(new RegExp( "\\$(.*)\\$(.*)\\$", "gi" ),
                                                function(all, group1, group2) {
                                                    return("<span style=\"color:" + group1 + ";\">" + group2 + "</span>");
                                                });
                            var ownerClean = companyObj.companyName.replace(new RegExp( "\\$(.*)\\$(.*)\\$", "gi" ),
                                                function(all, group1, group2) {
                                                    return(group2);
                                                });
                            lodash.assign(ownerObj, {ownerId: row.id, ownerClean: ownerClean, ownerRender: ownerRender, companyObj: companyObj, ownerFiscalDt: row.fiscalDt, ownerDefaultValidity: row.defaultValidity, ownerLogo: row.logo, ownerBigLogo: row.bigLogo, ownerFactorOk: row.factorok, ownerFactorNull: row.factornull });
                            callback(null, ownerObj);
                        }
                    });
                } else callback();
            }
        });
    } else callback();
};

Owner.prototype.getFlatVersion = function(ownerObj) {
    lodash.assign(ownerObj, company.getFlatVersion(ownerObj.companyObj));
    delete ownerObj.companyObj;
    return ownerObj;
};

module.exports = new Owner();

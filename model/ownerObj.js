var company = require("../model/companyObj");
var tools = require("../model/_tools");
var util = require("util");
var lodash = require("lodash");


// db.run("CREATE TABLE owner (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INT, fiscalDt INT, defaultValidity INT, logo TEXT, bigLogo TEXT, factorok REAL, factornull REAL, pattern TEXT, apecity TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'owner'); } });

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
                                db.run("UPDATE owner SET company_id = ?, fiscalDt = ?, defaultValidity = ?, logo = ?, bigLogo = ?, factorok = ?, factornull = ?, pattern = ?, apecity = ? WHERE id = ?",
                                    [ companyId, param.ownerFiscalDt, param.ownerDefaultValidity, param.ownerLogo, param.ownerBigLogo, param.ownerFactorOk, param.ownerFactorNull, param.ownerPattern, param.ownerAPECity, param.ownerId ],
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
                                db.run("INSERT INTO owner (company_id, fiscalDt, defaultValidity, logo, bigLogo, factorok, factornull, pattern, apecity) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
                                    [ companyId, param.ownerFiscalDt, param.ownerDefaultValidity, param.ownerLogo, param.ownerBigLogo, param.ownerFactorOk, param.ownerFactorNull, param.ownerPattern, param.ownerAPECity ],
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
        db.get("SELECT id, company_id, fiscalDt, defaultValidity, logo, bigLogo, factorok, factornull, pattern, apecity FROM owner WHERE id = ?", [ param.ownerId ], function(err, row) {
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
                            lodash.assign(ownerObj, {ownerId: row.id, ownerClean: ownerClean, ownerRender: ownerRender, companyObj: companyObj, ownerFiscalDt: row.fiscalDt, ownerDefaultValidity: row.defaultValidity, ownerLogo: row.logo, ownerBigLogo: row.bigLogo, ownerFactorOk: row.factorok, ownerFactorNull: row.factornull, ownerPattern: row.pattern, ownerAPECity: row.apecity });
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

Owner.prototype.getCalculatedPattern = function(db, pattern, callback) {
    if ( pattern != "" ) {
        // $yy$ = current year (or iso year if week)
        // $mm$ = current month
        // $ss$ = current week
        // $dd$ = current day
        // # = uniq ID
        var patternRender = tools.trim(pattern);
        var month = "00" + (new Date().getMonth() + 1);
        month = month.substr(month.length - 2);
        patternRender = patternRender.replace(/\$mm\$/gi, month);
        var day = "00" + (new Date().getDate());
        day = day.substr(day.length - 2);
        patternRender = patternRender.replace(/\$dd\$/gi, day);
        if (!patternRender.match(/\$ss\$/gi)) {
            patternRender = patternRender.replace(/\$yy\$/gi, new Date().getFullYear());
        } else {
            patternRender = patternRender.replace(/\$ss\$/gi, new Date().getWeek());
            patternRender = patternRender.replace(/\$yy\$/gi, new Date().getWeekYear());
        }

        // manage the uniq id (from server side, we need to look in database)
        var p = "";
        var pp = ""
        if (patternRender.match(/######/gi)) {
            p = "000000";
            pp = "______";
            patternRender = patternRender.replace(/######/gi, pp);
        } else if (patternRender.match(/#####/gi)) {
            p = "00000";
            pp = "_____";
            patternRender = patternRender.replace(/#####/gi, pp);
        } else if (patternRender.match(/####/gi)) {
            p = "0000";
            pp = "____";
            patternRender = patternRender.replace(/####/gi, pp);
        } else if (patternRender.match(/###/gi)) {
            p = "000";
            pp = "___";
            patternRender = patternRender.replace(/###/gi, pp);
        } else if (patternRender.match(/##/gi)) {
            p = "00";
            pp = "__";
            patternRender = patternRender.replace(/##/gi, pp);
        } else if (patternRender.match(/#/gi)) {
            p = "0";
            pp = "_";
            patternRender = patternRender.replace(/#/gi, pp);
        }

        db.get("SELECT MAX(CAST(SUBSTR(ref, INSTR('" + patternRender + "', '" + pp + "'), " + p.length + ") AS INT)) + 1 as pat FROM invoice WHERE ref LIKE '" + patternRender + "'", [], function(err, row) {
            if (err) callback(err);
            else {
                var n = p;
                if (row && row.pat) {
                    n += row.pat;
                } else {
                    n += 1;
                }
                patternRender = patternRender.replace(pp, n.substr(n.length - pp.length, n.length));
                callback(null, patternRender);
            }
        } );

    }
};

module.exports = new Owner();

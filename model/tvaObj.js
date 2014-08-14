var lodash = require("lodash");
var util = require('util');
var tools = require('../model/_tools');

// db.run("CREATE TABLE tva (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, percent REAL NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'tva'); } });

var TVA = function() {};

TVA.prototype.insertUpdate = function(db, param, next, callback) {
    
    if (!param.notstring) {
        console.log("on trim");
        tools.manageString(param);
    } else { console.log("on trim pas"); }
    
    if (param.TVAId && param.TVAId > 0) {
        // existing (update)
        db.run("UPDATE tva SET label = ?, percent = ? WHERE id = ?",
                [ param.TVALabel, param.TVAPercent, param.TVAId],
                function (err, row) {
                    if(err) {
                        console.log('SQL Error update TVA '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (this.changes && this.changes > 0)    {
                            console.log("update TVA OK (" + this.changes + ") : " + param.TVAId);
                            callback({msg:"ok", TVAId : param.TVAId});
                        } else {
                            console.log("update TVA NOK");
                            callback({msg:"nok", TVAId: 0});
                        }
                    }
                });
    } else {
        // new (insert)
        db.run("INSERT INTO TVA (label, percent) VALUES(?, ?)",
                [ param.TVALabel, param.TVAPercent],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error insert TVA '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (this.lastID)    {
                            console.log("insert TVA OK : " + this.lastID);
                            callback({msg:"ok", TVAId : this.lastID});
                        } else {
                            console.log("insert TVA NOK");
                            callback({msg:"nok", TVAId: 0});
                        }
                    }
                });
    }
};

TVA.prototype.findById = function( db, data, next, callback) {
    if (data.TVAId && data.TVAId > 0) {
        console.log("** START find TVA " + data.TVAId);
        var TVAObj = {};
        db.get("SELECT id, label, percent  FROM TVA WHERE id = ?", [data.TVAId], function(err, row) {
            if(err) {
                console.log('SQL Error findTVA '  + util.inspect(err, false, null));
                next(err);
            } else {
                if (row)    {
                    lodash.assign(TVAObj, {TVAId: row.id, TVALabel: row.label, TVAPercent: row.percent });
                    
                    //console.log("** find TVA " + util.inspect(TVAObj, false, null));
                    callback(TVAObj);
                } else {
                    callback(null);
                }
            }
        });
    } else callback(null);
};

TVA.prototype.findAll = function( db, next, callback) {
    var TVAList = [];
    db.all("SELECT id, label, percent  FROM TVA", [], function(err, rows) {
        if(err) {
            console.log('SQL Error findAllTVA '  + util.inspect(err, false, null));
            next(err);
        } else {
            if (rows)    {
                rows.forEach(function(row) {
                    var TVAObj = {};
                    lodash.assign(TVAObj, {TVAId: row.id, TVALabel: row.label, TVAPercent: row.percent });
                    TVAList.push(TVAObj);
                });
            }
                
            callback(TVAList);
        }
    });
};

TVA.prototype.delById = function(db, param, next, callback) {
    if (param.TVAId && param.TVAId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM groupProduct WHERE tva_id = ?",
                [ param.TVAId],
                function(err, row) {
                    if(err) {
                        console.log('SQL Error delete TVA check relation '+ util.inspect(err, false, null));
                       next(err);
                    } else {
                        if (row && row.nb > 0) {
                            console.log("Functional Error TVA : already used by " + row.nb + " groupProduct");
                            callback({msg:"rej", TVANb : row.nb});
                        } else {
                            db.run("DELETE FROM tva WHERE id = ?",
                                [ param.TVAId],
                                function (err, row) {
                                    if(err) {
                                        console.log('SQL Error delete TVA '+ util.inspect(err, false, null));
                                       next(err);
                                    } else {
                                        if (this.changes && this.changes > 0)    {
                                            console.log("delete TVA OK (" + this.changes + ") : " + param.TVAId);
                                            callback({msg:"ok", TVAId : this.changes});
                                        } else {
                                            console.log("delete TVA NOK");
                                            callback({msg:"nok", TVAId: 0});
                                        }
                                    }
                                });
                        }
                    }
                });
        
    } else callback({msg:"nok", TVAId: 0});
};

module.exports = new TVA();

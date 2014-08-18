var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");

// db.run("CREATE TABLE tva (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, percent REAL NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'tva'); } });

var TVA = function() {};

TVA.prototype.insertUpdate = function(db, param, callback) {

    if (!param.notstring) tools.manageString(param);

    if (param.TVAId && param.TVAId > 0) {
        // existing (update)
        db.run("UPDATE tva SET label = ?, percent = ? WHERE id = ?",
            [ param.TVALabel, param.TVAPercent, param.TVAId ],
            function (err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", TVAId : param.TVAId});
                    else                                    callback(null, {msg:"nok", TVAId: 0});
                }
            }
        ); // update
    } else {
        // new (insert)
        db.run("INSERT INTO TVA (label, percent) VALUES(?, ?)",
            [ param.TVALabel, param.TVAPercent ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    callback(null, {msg:"ok", TVAId : this.lastID});
                    else                callback(null, {msg:"nok", TVAId: 0});
                }
            }
        ); // insert
    }
};

TVA.prototype.findById = function(db, param, callback) {
    if (param.TVAId && param.TVAId > 0) {
        // console.log("** START find TVA " + param.TVAId);
        var TVAObj = {};
        db.get("SELECT id, label, percent  FROM TVA WHERE id = ?", [ param.TVAId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row)    {
                    lodash.assign(TVAObj, {TVAId: row.id, TVALabel: row.label, TVAPercent: row.percent });

                    //console.log("** find TVA " + util.inspect(TVAObj, false, null));
                    callback(null, TVAObj);
                } else callback();
            }
        });
    } else callback();
};

TVA.prototype.findAll = function(db, callback) {
    var TVAList = [];
    db.all("SELECT id, label, percent  FROM TVA", [], function(err, rows) {
        if (err) callback(err);
        else {
            if (rows) {
                rows.forEach(function(row) {
                    var TVAObj = {};
                    lodash.assign(TVAObj, {TVAId: row.id, TVALabel: row.label, TVAPercent: row.percent });
                    TVAList.push(TVAObj);
                });
            }
            callback(null, TVAList);
        }
    });
};

TVA.prototype.delById = function(db, param, callback) {
    if (param.TVAId && param.TVAId > 0) {
        // existing
        db.get("SELECT COUNT(id) as nb FROM groupProduct WHERE tva_id = ?", [ param.TVAId ], function(err, row) {
            if (err) callback(err);
            else {
                if (row && row.nb > 0) {
                    // console.log("Functional Error TVA : already used by " + row.nb + " groupProduct");
                    callback(null, {msg:"rej", TVANb : row.nb});
                } else {
                    db.run("DELETE FROM tva WHERE id = ?", [ param.TVAId ], function (err, row) {
                        if (err) callback(err);
                        else {
                            if (this.changes && this.changes > 0)   callback(null, {msg:"ok", TVAId : this.changes});
                            else                                    callback(null, {msg:"nok", TVAId: 0});
                        }
                    }); // tva deletion
                }
            }
        }); // get related groupproduct
    } else callback(null, {msg:"nok", TVAId: 0});
};

module.exports = new TVA();

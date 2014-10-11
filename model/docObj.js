var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");

// db.run("CREATE TABLE doc (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_id INT, url TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'doc'); } });
//

var Doc = function() {};

Doc.prototype.insertUpdate = function(db, param, callback) {

};

Doc.prototype.findById = function(db, param, callback) {

};

Doc.prototype.findAllByQuotationIds = function( db, param, callback ) {
    if (param.quotationIds && param.quotationIds.length > 0) {
        // registered quotation
        var docList = [];
        var p = [];
        var sql = "SELECT i.id, i.ref, i.version, i.creationDt, i.updateDt, i.endValidityDt, d.id as docId, d.url FROM invoice as i LEFT JOIN doc as d ON (d.invoice_id = i.id) WHERE i.id IN (";
        for (var i = 0; i < param.quotationIds.length; i++) {
            p.push(param.quotationIds[i]);
            sql += "?" + (i < param.quotationIds.length - 1 ? "," : "");
        }
        sql += ")";
        db.all(sql + " ORDER BY Version DESC", p,
            function(err, rows) {
                if (err) callback(err);
                else {
                    if (rows)    {
                        rows.forEach(function(row) {
                            var docObj = {};
                            lodash.assign(docObj, { quotationId: row.id, quotationRef: row.ref, quotationVersion: row.version, quotationCreationDt: (new Date(row.creationDt)).format("DD-MM-YYYY"), quotationUpdateDt: (new Date(row.updateDt)).format("DD-MM-YYYY HH:mm"), quotationEndValidityDt: row.endValidityDt ? (new Date(row.endValidityDt)).format("DD-MM-YYYY") : null, docId: row.docId, docURL: row.url } );
                            docList.push(docObj);
                        });
                        callback(null, docList);
                    } else callback(null, docList);
                }
            }
        );
    } else {
        callback(null, []); // no doc while in creation
    }
};

Doc.prototype.delById = function(db, param, callback) {
    if (param.docId && param.docId > 0) {
        // existing
        db.run("DELETE FROM doc WHERE id = ?",
            [ param.docId ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.changes && this.changes > 0)   callback(null, {msg:"ok", docId : this.changes});
                    else                                    callback(null, {msg:"nok", docId: 0});
                }
            }
        ); // paycond deletion
    } else callback(null, {msg:"nok", docId: 0});
};

Doc.prototype.delByQuotationId = function(db, param, callback) {
    if (param.quotationId && param.quotationId > 0) {
        // existing
        db.run("DELETE FROM doc WHERE invoice_id = ?",
            [ param.quotationId ],
            function(err, row) {
                if (err) callback(err);
                else callback(null, {msg:"nok", docId: 0});
            }
        ); // paycond deletion
    } else callback(null, {msg:"nok", docId: 0});
};

module.exports = new Doc();

var tools = require("../model/_tools");
var lodash = require("lodash");
var util = require("util");
var fs = require("fs");
var pdf = require("pdfkit");

// db.run("CREATE TABLE doc (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_id INT, url TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'doc'); } });
//

// constants for PDF generation
var margin = 30;
var widthLogo = 120;
var headerX = 400;
var headerCustomerX = 300;
var bold = "Helvetica-Bold";
var normal = "Helvetica";
var bigSize = 12;
var normalSize = 10;
var smallSize = 8;
var more = { continued : true };

var Doc = function() {};

Doc.prototype.insertUpdate = function(db, param, callback) {
    if (param.quotationId && param.quotationId > 0 && param.docURL && param.docURL != "") {
        db.run("INSERT INTO doc (invoice_id, url) VALUES (?, ?)",
            [ param.quotationId, param.docURL ],
            function(err, row) {
                if (err) callback(err);
                else {
                    if (this.lastID)    {
                        callback(null, { msg:"ok", docId : this.lastID });
                    } else {
                        callback(null, { msg:"nok", docId : -1 });
                    }
                }
            }
        );
    } else {
        callback(null, { msg:"nok", docId : -1 });
    }
};

Doc.prototype.findById = function(db, param, callback) {

};

Doc.prototype.findAllByQuotationIds = function( db, param, callback ) {
    if (param.quotationIds && param.quotationIds.length > 0) {
        // registered quotation
        var docList = [];
        var p = [];
        var sql = "SELECT i.id, i.type, i.ref, i.version, i.creationDt, i.updateDt, i.endValidityDt, d.id as docId, d.url FROM invoice as i LEFT JOIN doc as d ON (d.invoice_id = i.id) WHERE i.id IN (";
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
                            lodash.assign(docObj, { quotationId: row.id, quotationType: row.type, quotationRef: row.ref, quotationVersion: row.version, quotationCreationDt: (new Date(row.creationDt)).format("DD-MM-YYYY"), quotationUpdateDt: (new Date(row.updateDt)).format("DD-MM-YYYY HH:mm"), quotationEndValidityDt: row.endValidityDt ? (new Date(row.endValidityDt)).format("DD-MM-YYYY") : null, docId: row.docId, docURL: row.url } );
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

Doc.prototype.generateDoc = function(db, param, callback) {
    var generatedDoc = null;
    if (param.quotationId && param.quotationId > 0 && param.quotationObj != null) {
        console.log("** Facture courante trouvee");
        // is already exists a doc in database for this quotationId ?
        // if yes, it should have been in quotationDocList
        var already = -1;
        for(var i = 0; i < param.quotationObj.quotationDocList.length; i++) {
            if (param.quotationObj.quotationDocList[i].quotationId == param.quotationId && param.quotationObj.quotationDocList[i].docId) already = i;
        }
        if (already >= 0) {
            // need to delete the previous one
            console.log("** ** Doc existant");
        } else console.log("** ** new Doc");

        // -----------------------------------------------------------------------------
        // START
        var thedoc = new pdf( { bufferPages: true, margin: margin });

        // -----------------------------------------------------------------------------
        // LOGO
        // check if the owner has a big logo
        // draw it in top left corner
        var wl = 0;
        if (param.ownerObj && param.ownerObj.ownerBigLogo != "") {
            wl = widthLogo;
            thedoc.image( "./client" + param.ownerObj.ownerBigLogo, margin, margin, { width: widthLogo });
        } else if (param.ownerObj && param.ownerObj.ownerLogo != "") { // in bad case, use only logo
            thedoc.image( "./client" + param.ownerObj.ownerLogo, margin, margin, { width: widthLogo });
            wl = widthLogo
        }

        // -----------------------------------------------------------------------------
        // IDENTITY OWNER
        console.log("****" + param.ownerObj.companyName);
        thedoc.font(bold);
        thedoc.fontSize(bigSize);
        if (param.ownerObj.companyName.match(/\$(.*)\$(.*)\$/gi)) {
            console.log("Special Name");
            var splitted = param.ownerObj.companyName.split(/\$(.*)\$(.*)\$/gi);
            thedoc.text(splitted[0], wl + margin + 10, margin + 10, more );
            thedoc.fillColor(splitted[1]);
            thedoc.text(splitted[2], more);
            thedoc.fillColor("black");
            thedoc.text(" " + param.ownerObj.companyLegal);
        } else {
            thedoc.text(param.ownerObj.companyName + " " + param.ownerObj.companyLegal, wl + margin + 10, margin);
        }
        thedoc.font(normal);
        thedoc.fontSize(normalSize);
        // ADDRESS
        if (param.ownerObj.addressLine1) thedoc.text(param.ownerObj.addressLine1);
        if (param.ownerObj.addressLine2) thedoc.text(param.ownerObj.addressLine2);
        if (param.ownerObj.addressCP || param.ownerObj.addressCity) thedoc.text(param.ownerObj.addressCP + (param.ownerObj.addressCP ? " " : "") + param.ownerObj.addressCity);

        thedoc.text(" ");

        thedoc.fontSize(smallSize);
        if (param.ownerObj.contactTel) {
            thedoc.font(bold);
            thedoc.text("Tél: ", more );
            thedoc.font(normal);
            thedoc.text(param.ownerObj.contactTel, more);
        }
        if (param.ownerObj.contactMobile) {
            thedoc.text(" / ", more);
            thedoc.font(bold);
            thedoc.text("Mob : ", more );
            thedoc.font(normal);
            thedoc.text(param.ownerObj.contactMobile);
        } else if (param.ownerObj.contactTel) thedoc.text("");
        if (param.ownerObj.contactFax) {
            thedoc.font(bold);
            thedoc.text("Fax : ", more );
            thedoc.font(normal);
            thedoc.text(param.ownerObj.contactFax);
        }
        if (param.ownerObj.addressURL) thedoc.text(param.ownerObj.addressURL);

        thedoc.text(" ");

        thedoc.font(bold);
        thedoc.text("SIRET : ", more );
        thedoc.font(normal);
        thedoc.text(param.ownerObj.companySiret);
        thedoc.font(normal);
        thedoc.text(param.ownerObj.companyAPE + " - " + param.ownerObj.ownerAPECity);

        thedoc.fontSize(normalSize);

        /*if (param.ownerObj.contactMail) {
            thedoc.font(bold);
            thedoc.text("Email : ", more );
            thedoc.font(normal);
            thedoc.text(param.ownerObj.contactMail);
        }*/


        range = thedoc.bufferedPageRange();

        console.log("RANGE = " + util.inspect(range, false, null));

        // -----------------------------------------------------------------------------
        // FOOTER
        for(var np = range.start; np < range.start + range.count; np++) {
            thedoc.switchToPage(np);
            thedoc.text("Page " + (np + 1) + " sur " + range.count, margin + 5, 720);
        }
        // FINISH
        thedoc.flushPages()
        thedoc.end();
        var docName = "/doc/" + param.quotationObj.quotationRef + "_" + param.quotationObj.quotationVersion + "_" + (new Date().getTime()) + ".pdf";
        thedoc.pipe(fs.createWriteStream("./client" + docName));
        var self = this;
        this.insertUpdate(db, { quotationId: param.quotationId, docURL: docName }, function(err, ret) {
            if (ret.msg == "ok") {
                if (already >= 0) {
                    // delete the old one
                    console.log("** ** Efface ancien Doc : " + param.quotationObj.quotationDocList[already].docURL);
                    self.delById(db, { docId: param.quotationObj.quotationDocList[already].docId }, function (err, ret) {} );
                    fs.unlink("./client" + param.quotationObj.quotationDocList[already].docURL);
                }
                var generatedDoc = {};
                lodash.assign(generatedDoc, { quotationId: param.quotationId, quotationRef: param.quotationObj.quotationRef, quotationVersion: param.quotationObj.quotationVersion, quotationCreationDt: (new Date(param.quotationObj.quotationCreationDt)).format("DD-MM-YYYY"), quotationUpdateDt: (new Date(param.quotationObj.quotationUpdateDt)).format("DD-MM-YYYY HH:mm"), quotationEndValidityDt: param.quotationObj.quotationEndValidityDt ? (new Date(param.quotationObj.quotaitonEndValidityDt)).format("DD-MM-YYYY") : null, docId: ret.docId, docURL: docName } );
                callback(null, generatedDoc);
            } else callback(null, generatedDoc);
        });
    } else callback(null, generatedDoc);
};
module.exports = new Doc();

var tools = require("../model/_tools");
var lodash = require("lodash");
var lwip = require("lwip");
var util = require("util");
var fs = require("fs");
var pdf = require("pdfkit");

// db.run("CREATE TABLE doc (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_id INT, url TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'doc'); } });
//

// constants for PDF generation

var maxA4X = 595;
var maxA4Y = 841;

var margin = 30;
var d = 5;

var widthLogo = 120;
var heightLogo = 0;
var Logo = "";

var headerX = 340;
var headerCustomerX = maxA4X / 2 + 3 * d;
var widthCustomer = headerCustomerX - d * 3 - margin;

var headerSecondLineY = 200;
var betweenHeaderTableY = 0;

var startTab = 0;
var startTTC = 0;

var bold = "Helvetica-Bold";
var italic = "Helvetica-Oblique";
var normal = "Helvetica";
var bigSize = 10;
var normalSize = 9;
var smallSize = 8;
var tinySize = 8;

var tabW = [ 35, 180, 55, 25, 75, 55, 55, 55 ]; // == maxA4X - 2 * margin :)
var TTCWDate = 50;
var TTCWLabel = 100;
var TTCW = 70;
var TTCTableX = maxA4X - margin - TTCWLabel - TTCW;
var tabHead = [ "Code", "Désignation", "P.U. (HT)", "Qté", "TVA", "TTC", "Remise", "Total TTC" ];
var more = { continued : true };

// var need for calculation

    var total = 0;
    var tva = [];
    var tvaLab = [];
    var nextSubtotal = 0;


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
        // is already exists a doc in database for this quotationId ?
        // if yes, it should have been in quotationDocList
        var already = -1;
        for(var i = 0; i < param.quotationObj.quotationDocList.length; i++) {
            if (param.quotationObj.quotationDocList[i].quotationId == param.quotationId && param.quotationObj.quotationDocList[i].docId) already = i;
        }
        // -----------------------------------------------------------------------------
        // CALCULATION FOR LOGO
        if (param.ownerObj && param.ownerObj.ownerBigLogo != "") {
            Logo = "./client" + param.ownerObj.ownerBigLogo;
        } else if (param.ownerObj && param.ownerObj.ownerLogo != "") { // in bad case, use only logo
            Logo = "./client" + param.ownerObj.ownerLogo;
        }
        var self = this;
        lwip.open(Logo, function(err, image) {
            if (!err) {
                var ratio = 1;
                if (image.width() > widthLogo) ratio = widthLogo / image.width();
                heightLogo = image.height() * ratio;
            } // else no logo or not readable

            // -----------------------------------------------------------------------------
            // START
            var thedoc = new pdf( { bufferPages: true, margin: margin, size: "A4", layout: "portrait" });
            addTheHeader(thedoc, param);

            // -----------------------------------------------------------------------------
            // MAIN PART
            addHeaderTable(thedoc, param);

            addContentTable(thedoc, param);

            // can we add Tables on the current page ?
            if ((getHTotalTable() + startTTC >= maxA4Y - margin - 6 * bigSize) || (getHPaymentTable(param) + startTTC >= maxA4Y - margin - 6 * bigSize)) {
                // NO
                console.log("New Page because of total tables");
                // 1 finish last page
                addTheFooter(thedoc, param);
                // 2 start new page
                thedoc.addPage( { margin: margin, size: "A4", layout: "portrait" } );
                range = thedoc.bufferedPageRange();
                thedoc.switchToPage(range.start + range.count - 1); // go to the last page
                addTheHeader(thedoc, param);

                startTTC = startTab + normalSize * 2.5;
            }
            addTotalTable(thedoc, param);
            addPaymentTable(thedoc, param);

            addTheFooter(thedoc, param);


            range = thedoc.bufferedPageRange();

            console.log("RANGE = " + util.inspect(range, false, null));

            // -----------------------------------------------------------------------------
            // FOOTER
            for(var np = range.start; np < range.start + range.count; np++) {
                thedoc.switchToPage(np);
                thedoc.font(normal).fontSize(normalSize).text("Page " + (np + 1) + " / " + range.count, maxA4X - 200 - margin, headerSecondLineY + betweenHeaderTableY, { width: 200, align: 'right' });
            }
            // FINISH
            thedoc.flushPages()
            thedoc.end();
            var docName = "/doc/" + param.quotationObj.quotationRef + "_" + param.quotationObj.quotationVersion + "_" + (new Date().getTime()) + ".pdf";
            thedoc.pipe(fs.createWriteStream("./client" + docName));
            self.insertUpdate(db, { quotationId: param.quotationId, docURL: docName }, function(err, ret) {
                if (ret.msg == "ok") {
                    if (already >= 0) {
                        // delete the old one
                        self.delById(db, { docId: param.quotationObj.quotationDocList[already].docId }, function (err, ret) {} );
                        fs.unlink("./client" + param.quotationObj.quotationDocList[already].docURL);
                    }
                    var generatedDoc = {};
                    lodash.assign(generatedDoc, { quotationId: param.quotationId, quotationRef: param.quotationObj.quotationRef, quotationVersion: param.quotationObj.quotationVersion, quotationCreationDt: (new Date(param.quotationObj.quotationCreationDt)).format("DD-MM-YYYY"), quotationUpdateDt: (new Date(param.quotationObj.quotationUpdateDt)).format("DD-MM-YYYY HH:mm"), quotationEndValidityDt: param.quotationObj.quotationEndValidityDt ? (new Date(param.quotationObj.quotaitonEndValidityDt)).format("DD-MM-YYYY") : null, docId: ret.docId, docURL: docName } );
                    callback(null, generatedDoc);
                } else callback(null, generatedDoc);
            });
        });
    } else callback(null, generatedDoc);
};

var addTheHeader = function(thedoc, param) {
    // -----------------------------------------------------------------------------
    // QUOTATION ?
    if (param.quotationObj.quotationType == -1) {
        thedoc.image("./client/im/quotationback.png", margin, (maxA4Y - 796) / 2.0);
    }

    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // LOGO
    // check if the owner has a big logo
    // draw it in top left corner
    var wl = 0;
    if (Logo != "") {
        wl = widthLogo;
        thedoc.image( Logo, margin, margin, { width: widthLogo });
        headerSecondLineY = heightLogo + bigSize * 3 + margin;
    }

    // -----------------------------------------------------------------------------
    // IDENTITY OWNER
    thedoc.font(bold);
    thedoc.fontSize(bigSize);
    if (param.ownerObj.companyName.match(/\$(.*)\$(.*)\$/gi)) {
        var splitted = param.ownerObj.companyName.split(/\$(.*)\$(.*)\$/gi);
        thedoc.text(splitted[0], wl + margin + d, margin + d, more );
        thedoc.fillColor(splitted[1]).text(splitted[2], more);
        thedoc.fillColor("black").text(" " + param.ownerObj.companyLegal);
    } else {
        thedoc.text(param.ownerObj.companyName + " " + param.ownerObj.companyLegal, wl + margin + d, margin);
    }
    thedoc.font(normal).fontSize(normalSize);
    // -----------------------------------------------------------------------------
    // ADDRESS
    if (param.ownerObj.addressLine1) thedoc.text(param.ownerObj.addressLine1);
    if (param.ownerObj.addressLine2) thedoc.text(param.ownerObj.addressLine2);
    if (param.ownerObj.addressCP || param.ownerObj.addressCity) thedoc.text(param.ownerObj.addressCP + (param.ownerObj.addressCP ? " " : "") + param.ownerObj.addressCity);

    thedoc.text(" ");

    thedoc.fontSize(smallSize);
    if (param.ownerObj.contactTel) {
        thedoc.font(bold).text("Tél : ", more );
        thedoc.font(normal).text(param.ownerObj.contactTel, more);
    }
    if (param.ownerObj.contactMobile) {
        if (param.ownerObj.contactTel) thedoc.text(" / ", more);
        thedoc.font(bold).text("Mob : ", more );
        thedoc.font(normal).text(param.ownerObj.contactMobile);
    } else if (param.ownerObj.contactTel) thedoc.text("");
    if (param.ownerObj.contactFax) {
        thedoc.font(bold).text("Fax : ", more );
        thedoc.font(normal).text(param.ownerObj.contactFax);
    }
    if (param.ownerObj.addressURL) thedoc.text(param.ownerObj.addressURL);

    thedoc.text(" ");

    thedoc.font(bold).text("SIRET : ", more );
    thedoc.font(normal).text(param.ownerObj.companySiret);
    thedoc.font(normal).text(param.ownerObj.companyAPE + " - " + param.ownerObj.ownerAPECity);
    if (thedoc.y + bigSize * 3 > headerSecondLineY) {
        headerSecondLineY = thedoc.y + bigSize * 3;
    }

    // -----------------------------------------------------------------------------
    // Header (invoice/quotation)
    thedoc.font(bold).fontSize(bigSize).text((param.quotationObj.quotationType == -1 ? "Devis n° " : "Facture n° ") + param.quotationObj.quotationRef, headerX, margin + d);
    thedoc.font(normal).fontSize(normalSize);
    thedoc.text("Exemplaire Client", headerX, margin + d + bigSize);
    thedoc.text("Ticket n° " + (new Date()).format("YYYY-MM-DD") + "-" + param.quotationObj.quotationId, headerX, margin + d + bigSize * 3);
    thedoc.text("Date d'Emission : " + (new Date()).format("DD-MM-YYYY"), headerX, margin + d + bigSize * 4);
    thedoc.text((param.quotationObj.quotationType == -1 ? "Date de Fin de Validité : " + (new Date(param.quotationObj.quotationEndValidityDt)).format("DD-MM-YYYY") : "Date de Vente : " + (new Date(param.quotationObj.quotationCreationDt)).format("DD-MM-YYYY")), headerX, margin + d + bigSize * 5);

    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // Customer part
    thedoc.font(bold).fontSize(normalSize);
    var y = 0;
    // COMPANY ?
    var customer = null;
    if (param.quotationObj.customerObj.customerType == -1) {
        customer = param.quotationObj.customerObj.companyObj;
        thedoc.text(customer.companyName, headerCustomerX, headerSecondLineY);
        y+=bigSize;
    } else {
        customer = param.quotationObj.customerObj.personObj;
    }
    // Main contact
    var customerName = param.quotationObj.customerObj.personObj.personGender;
    customerName += (customerName != "" ? " " : "") + param.quotationObj.customerObj.personObj.personLastname;
    customerName += (customerName != "" ? " " : "") + param.quotationObj.customerObj.personObj.personFirstname;
    thedoc.text(customerName, headerCustomerX, headerSecondLineY + y);
    y+= bigSize;
    // -----------------------------------------------------------------------------
    // ADDRESS Customer
    thedoc.font(normal);
    if (customer.addressObj && customer.addressObj.addressLine1) {
        thedoc.text(customer.addressObj.addressLine1, headerCustomerX, headerSecondLineY + y);
        y+= bigSize;
    }
    if (customer.addressObj && customer.addressObj.addressLine2) {
        thedoc.text(customer.addressObj.addressLine2, headerCustomerX, headerSecondLineY + y);
        y+= bigSize;
    }
    if (customer.addressObj && (customer.addressObj.addressCP || customer.addressObj.addressCity)) {
        thedoc.text(customer.addressObj.addressCP + (customer.addressObj.addressCP ? " " : "") + customer.addressObj.addressCity, headerCustomerX, headerSecondLineY + y);
        y+= bigSize;
    }
    if (customer.addressObj && customer.addressObj.addressURL) {
        thedoc.text(customer.addressObj.addressURL, headerCustomerX, headerSecondLineY + y);
        y+= bigSize;
    }
    if (customer.contactObj && customer.contactObj.contactTel) {
        thedoc.font(bold).text("Tél : ", headerCustomerX, headerSecondLineY + y, more );
        thedoc.font(normal).text(customer.contactObj.contactTel, more);
    }
    if (customer.contactObj && customer.contactObj.contactMobile) {
        if (customer.contactObj && customer.contactObj.contactTel) thedoc.text(" / ", more);
        thedoc.font(bold).text("Mob : ", more );
        thedoc.font(normal).text(param.ownerObj.contactMobile);
    } else if (customer.contactObj && customer.contactObj.contactTel) thedoc.text("");
    // a company without direct contact... try to get those of the main contact
    if (param.quotationObj.customerObj.customerType == -1 && (!customer.contactObj || (!customer.contactObj.contactTel && !customer.contactObj.contactMobile))) {
        if (param.quotationObj.customerObj.personObj.contactObj && param.quotationObj.customerObj.personObj.contactObj.contactTel) {
            thedoc.font(bold).text("Tél : ", headerCustomerX, headerSecondLineY + y, more );
            y+= bigSize;
            thedoc.font(normal).text(param.quotationObj.customerObj.personObj.contactObj.contactTel, more);
        }
        if (param.quotationObj.customerObj.personObj.contactObj && param.quotationObj.customerObj.personObj.contactObj.contactMobile) {
            if (param.quotationObj.customerObj.personObj.contactObj && param.quotationObj.customerObj.personObj.contactObj.contactTel) thedoc.text(" / ", more);
            thedoc.font(bold).text("Mob : ", more );
            thedoc.font(normal).text(param.ownerObj.contactMobile);
        } else if (param.quotationObj.customerObj.personObj.contactObj && param.quotationObj.customerObj.personObj.contactObj.contactTel) thedoc.text("");
    } else {
        y+= bigSize;
    }
    if (customer.contactObj && customer.contactObj.contactMail) {
        thedoc.font(bold).text("Email : ", headerCustomerX, headerSecondLineY + y, more );
        thedoc.font(normal).text(customer.contactObj.contactMail);
    }
    if (param.quotationObj.customerObj.customerType == -1 && (!customer.contactObj || !customer.contactObj.contactMail)) {
        if (param.quotationObj.customerObj.personObj.contactObj && param.quotationObj.customerObj.personObj.contactObj.contactMail) {
            thedoc.font(bold).text("Email : ", headerCustomerX, headerSecondLineY + y, more );
            y+= bigSize;
            thedoc.font(normal).text(param.quotationObj.customerObj.personObj.contactObj.contactMail);
        }
    } else {
        y+= bigSize;
    }

    y+= bigSize;
    betweenHeaderTableY =  y + d * 3;

    // The border of customer part
    thedoc.rect(headerCustomerX - d * 3, headerSecondLineY - d * 3, widthCustomer, betweenHeaderTableY).stroke("#000");

    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // Contact part
    thedoc.font(bold).fontSize(normalSize);
    y = 0;

    // border for Contact
    thedoc.rect(margin, headerSecondLineY - d * 3, headerCustomerX - margin - d * 4, betweenHeaderTableY).fillAndStroke("#ccc", "#ccc");
    thedoc.fill("#000");

    thedoc.text("Votre contact : ", margin + d * 3, headerSecondLineY + y, more );
    thedoc.font(normal).text(param.ownerObj.username);
    y+= bigSize;

    if (param.ownerObj.contactMail) {
        thedoc.font(bold).text("Email : ", margin + d * 3, headerSecondLineY + y, more );
        thedoc.font(normal).text(param.ownerObj.contactMail);
        y+= bigSize;
    }

    thedoc.fontSize(tinySize);
    y = betweenHeaderTableY;
    // pay conditions
    if (param.quotationObj.payCondObj && param.quotationObj.payCondObj.payCondLabel != "") {
        thedoc.text("Conditions de réglement : ", margin, headerSecondLineY + y, more );
        thedoc.text(param.quotationObj.payCondObj.payCondLabel);
        y+= bigSize;
    }
    // legal mention for pro
    if (param.quotationObj.quotationType == 1 && param.quotationObj.customerObj && param.quotationObj.customerObj.customerType == -1) {
        thedoc.text("Pénalité de retard : trois fois le taux d'intérêt légal", margin, headerSecondLineY + y );
        y+= bigSize;
    }
    // payments types accepted
    if (param.quotationObj.quotationPayTypeList.length > 0) {
        thedoc.text("Types de paiement acceptés : ", margin, headerSecondLineY + y, more );
        for (var i = 0; i < param.quotationObj.quotationPayTypeList.length; i++) {
            thedoc.text( (i==0 ? "": ", ") + param.quotationObj.quotationPayTypeList[i].payTypeLabel, more );
        }
        thedoc.text(""); // remove "more"
        y+= bigSize;
    }

    // customer note
    if (param.quotationObj.quotationCustomerNote && param.quotationObj.quotationCustomerNote != "") {
        var note = param.quotationObj.quotationCustomerNote.split("\n");
        for (var i = 0; i < note.length; i++) {
            thedoc.fontSize(normalSize).text( note[i], margin, headerSecondLineY + y, { width: maxA4X - 2 * margin, align: 'center' });
            y+= bigSize;
        }
    }

    startTab = headerSecondLineY + y + bigSize * 2;
};


// cst for each columns


var addHeaderTable = function(thedoc, param) {
    // need to create the header
    thedoc.lineWidth(1).rect(margin, startTab, maxA4X - 2 * margin, normalSize * 2).stroke("#000");
    var x = margin;
    thedoc.fontSize(tinySize);
    for (var i = 0; i < tabW.length; i++) {
        thedoc.lineWidth(1).rect(x, startTab, tabW[i], normalSize * 2).stroke("#000");
        thedoc.text(tabHead[i], x, startTab + normalSize / 2.0 + 2, { width: tabW[i], align: 'center' } );
        x += tabW[i];
    }
};

var getColumnX = function(i) {
    var ret = margin;
    for (var j=0; j < i; j++) ret += tabW[j];
    return ret;
};

var addContentTable = function(thedoc, param) {
    // clear variables

    total = 0;
    tva = [];
    tvaLab = [];
    nextSubtotal = 0;
    var taby = [];
    taby[0] = startTab + normalSize * 2.5;
    thedoc.fontSize(tinySize);

    var presta = param.quotationObj.quotationPrestaList;
    for(var i = 0; i < param.quotationObj.quotationPrestaList.length; i++) {
        // can we add the new LINE on the current page ?
        var nextLineH = 0;
        if (presta[i].prestaST) { // case 1 : SubTotal
            // label
            nextLineH = tinySize + normalSize / 2.0;
        } else if (presta[i].productObj == null) {   // case 2 : free text
            nextLineH = tinySize + normalSize / 2.0;
            if (thedoc.widthOfString( presta[i].prestaFreeField.replace(/(<([^>]+)>)/ig,"").replace("&nbsp;", " ") ) >= maxA4X - 2 * margin) nextLineH += tinySize;
        } else {
            var p = presta[i].productObj;
            nextLineH = tinySize + normalSize / 2.0;
            if (thedoc.widthOfString( " " + p.productLabel+ (p.productUnit != "" ? " (/" + p.productUnit + ")" : "") ) >= maxA4X - 2 * margin) nextLineH += tinySize;
        }
        if (nextLineH + taby[i] >= maxA4Y - margin - 6 * bigSize) {
            console.log("New Page because of content");
            // NO
            // 1 finish the border
            thedoc.lineWidth(1);
            thedoc.rect(margin, startTab, maxA4X - 2 * margin, taby[i] - taby[0] + 1 + normalSize * 2).stroke("#000");
            // 2 finish last page
            addTheFooter(thedoc, param);
            // 3 start new page
            thedoc.addPage( { margin: margin, size: "A4", layout: "portrait" } );
            range = thedoc.bufferedPageRange();
            thedoc.switchToPage(range.start + range.count - 1); // go to the last page
            addTheHeader(thedoc, param);
            addHeaderTable(thedoc, param);
            taby[i] = startTab + normalSize * 2.5; // reset the current line position
        }
        if (presta[i].prestaST) {                   // case 1 : SubTotal
            // label
            thedoc.font(bold).text( "SOUS-TOTAL", getColumnX(6), taby[i], { width: tabW[6], align: 'right' });
            taby[i + 1] = thedoc.y + normalSize / 2.0;
            // sub-total
            thedoc.rect(margin, taby[i] - normalSize / 2.0 + 1, maxA4X - 2 * margin, taby[i + 1] - taby[i]).fillAndStroke("#eee", "#eee");
            thedoc.fill("#000");
            thedoc.font(bold).text( "SOUS-TOTAL", getColumnX(6), taby[i], { width: tabW[6], align: 'right' });
            thedoc.font(bold).text( tools.formatAmount(nextSubtotal) + " ", getColumnX(7), taby[i], { width: tabW[7] - d, align: 'right' });
            nextSubtotal = 0;
        } else if (presta[i].productObj == null) {   // case 2 : free text
            thedoc.font(normal).text( presta[i].prestaFreeField.replace(/(<([^>]+)>)/ig,"").replace("&nbsp;", " "), getColumnX(0), taby[i], { width: maxA4X - 2 * margin, align: 'center' });
            taby[i + 1] = thedoc.y + normalSize / 2.0;
        } else {
            var p = presta[i].productObj;
            // LABEL
            thedoc.font(normal).text( " " + p.productLabel+ (p.productUnit != "" ? " (/" + p.productUnit + ")" : ""), getColumnX(1), taby[i], { width: tabW[1], align: 'left' });
            taby[i + 1] = thedoc.y + normalSize / 2.0;

            var delta = (thedoc.y - taby[i] - tinySize - 1) / 2.0;
            // CODE
            thedoc.font(normal).text( p.productCode, getColumnX(0), taby[i] + delta, { width: tabW[0], align: 'center' });
            // Unit Price (Without Taxes)
            thedoc.font(normal).text( tools.formatAmount( tools.getHT( p.productTTC, p.TVAPercent )), getColumnX(2), taby[i] + delta, { width: tabW[2] - d, align: 'right' });
            // Quantity
            thedoc.font(normal).text( presta[i].prestaQuantity, getColumnX(3), taby[i] + delta, { width: tabW[3], align: 'center' });
            // TVA
            var discount = (presta[i].prestaDiscount > 0 ? ((100 - presta[i].prestaDiscount ) / 100.0) : 1);
            thedoc.font(normal).text( p.TVALabel + " (" + tools.formatAmount((p.productTTC - tools.getHT(p.productTTC, p.TVAPercent) ) * presta[i].prestaQuantity * discount) + ")", getColumnX(4), taby[i] + delta, { width: tabW[4], align: 'center' });
            var localsubtotal = p.productTTC * presta[i].prestaQuantity;
            // Line Price (Without discount)
            thedoc.font(normal).text( tools.formatAmount(localsubtotal), getColumnX(5), taby[i] + delta, { width: tabW[5] - d, align: 'right' });
            localsubtotal *= discount;
            if (!tva[p.TVAId]) {
                tva[p.TVAId] = 0;
                tvaLab[p.TVAId] = p.TVALabel;
            }
            tva[p.TVAId] += (p.productTTC - tools.getHT(p.productTTC, p.TVAPercent) ) * presta[i].prestaQuantity * discount;
            // Discount
            thedoc.font(normal).text(  presta[i].prestaDiscount && presta[i].prestaDiscount > 0 ? presta[i].prestaDiscount + " %" : " ", getColumnX(6), taby[i] + delta, { width: tabW[6] - d, align: 'right' });
            // Line Price (With discount)
            thedoc.font(normal).text( tools.formatAmount(localsubtotal), getColumnX(7), taby[i] + delta, { width: tabW[7] - d, align: 'right' });
            total += localsubtotal;
            nextSubtotal += localsubtotal;
        }
    }

    // now the border
    thedoc.lineWidth(1);
    thedoc.rect(margin, startTab, maxA4X - 2 * margin, taby[presta.length] - taby[0] + 1 + normalSize * 2).stroke("#000");

    startTTC = taby[presta.length] + bigSize * 2;
};

var getHTotalTable = function() {
    var y = bigSize / 2.0;
    // Total without GlobalDiscount
    y += normalSize + normalSize / 2;
    // GlobalDiscount
    y += normalSize + normalSize / 2;
    // Total with GlobalDiscount
    y += normalSize + normalSize / 2;
    // TVA
    if (tvaLab.length > 0) {
        for(TVAId in tvaLab) {
            y += tinySize + tinySize / 2;
        }
    }
    return y;
}

var addTotalTable = function(thedoc, param) {
    var y = startTTC + bigSize / 2.0;
    // Total without GlobalDiscount
    thedoc.font(normal).text( "Total TTC", TTCTableX + d, y, { width: TTCWLabel, align: 'left' });
    thedoc.font(normal).text( tools.formatAmount(total), TTCTableX + TTCWLabel, y, { width: TTCW - d, align: 'right' });
    y = thedoc.y + normalSize / 2;
    thedoc.lineWidth(1).rect(TTCTableX, startTTC, maxA4X - margin - TTCTableX, y - startTTC - 3).stroke("#000");

    // GlobalDiscount
    var percent = Math.round(param.quotationObj.quotationGlobalDiscount * 100 / total * 100) / 100;
    thedoc.font(normal).text( "Remise globale ( " + tools.formatProfit(isNaN(percent) ? 0 : percent) + " % )", TTCTableX + d, y, { width: TTCWLabel, align: 'left' });
    thedoc.font(normal).text( tools.formatAmount(param.quotationObj.quotationGlobalDiscount), TTCTableX + TTCWLabel, y, { width: TTCW - d, align: 'right' });
    y = thedoc.y + normalSize / 2;
    thedoc.lineWidth(1).rect(TTCTableX, startTTC, maxA4X - margin - TTCTableX, y - startTTC - 3).stroke("#000");

    // Total with GlobalDiscount
    thedoc.fontSize(normalSize).font(bold).text( "Total Net à Payer TTC", TTCTableX + d, y, { width: TTCWLabel, align: 'left' });
    var y2 = thedoc.y + normalSize / 2;
    thedoc.lineWidth(1).rect(TTCTableX, y - 2, maxA4X - margin - TTCTableX, y2 - y - 4).fillAndStroke("#eee", "#eee");
    thedoc.fill("#000").fontSize(normalSize).font(bold).text( "Total Net à Payer TTC", TTCTableX + d, y, { width: TTCWLabel, align: 'left' });
    thedoc.fontSize(normalSize).font(bold).text( tools.formatAmount(total - param.quotationObj.quotationGlobalDiscount), TTCTableX + TTCWLabel, y, { width: TTCW - 2, align: 'right' });
    y = thedoc.y + normalSize / 2;
    thedoc.lineWidth(1).rect(TTCTableX, startTTC, maxA4X - margin - TTCTableX, y - startTTC - 4).stroke("#000");

    // TVA
    if (tvaLab.length > 0) {
        for(TVAId in tvaLab) {
            thedoc.fontSize(tinySize).font(italic).text( "dont " + tvaLab[TVAId], TTCTableX, y, { width: TTCWLabel - d, align: 'right' });
            thedoc.fontSize(tinySize).font(italic).text( tools.formatAmount( tva[TVAId] * (100 - percent) / 100 ), TTCTableX + TTCWLabel, y, { width: TTCW - d, align: 'right' });
            y = thedoc.y + tinySize / 2;
        }
    }

    // now the border
    thedoc.lineWidth(1).rect(TTCTableX, startTTC, maxA4X - margin - TTCTableX, y - startTTC).stroke("#000");

};

var getHPaymentTable = function(param) {
    var y = bigSize / 2.0;
    // header
    y += normalSize + normalSize / 2;
    if (param.quotationObj.quotationRealDeposite && param.quotationObj.quotationRealDeposite > 0) {
        // Real Deposite for Quotation
        y += normalSize + normalSize / 2;
    } else {
        var deposite = 0;
        if (param.quotationObj.quotationDepositeForseen && param.quotationObj.quotationDepositeForseen > 0) deposite = param.quotationObj.quotationDepositeForseen;
        else {
            if (param.quotationObj.payCondObj && param.quotationObj.payCondObj.payCondTVA > 0) {
                deposite = param.quotationObj.payCondObj.payCondTVA / 100 * (total - param.quotationObj.quotationGlobalDiscount);
            }
        }
        if (deposite > 0) {
            // Forseen Deposite for Quotation
            y += normalSize + normalSize / 2;
        }
    }

    if (param.quotationObj.quotationPaymentList && param.quotationObj.quotationPaymentList.length > 0) {
        for (var i = 0; i < param.quotationObj.quotationPaymentList.length; i++) {
            y += normalSize + normalSize / 2;
        }
        y += normalSize + normalSize / 2; // the rest to due
    }
};

var addPaymentTable = function(thedoc, param) {
    var y = startTTC + bigSize / 2.0;
    thedoc.font(bold).text( "Date", margin + d, y, { width: TTCWDate, align: 'left' });
    thedoc.font(bold).text( "Type" , margin + d + TTCWDate , y, { width: TTCWLabel, align: 'left' });
    thedoc.font(bold).text( "Montant", margin + TTCWLabel + TTCWDate + d, y, { width: TTCW, align: 'left' });
    y = thedoc.y + normalSize / 2;
    thedoc.lineWidth(1).rect(margin, startTTC, TTCWLabel + TTCW + TTCWDate, y - startTTC - 3).stroke("#000");
    if (param.quotationObj.quotationRealDeposite && param.quotationObj.quotationRealDeposite > 0) {
        // Real Deposite for Quotation
        thedoc.font(normal).text( "Acompte", margin + d + TTCWDate, y, { width: TTCWLabel, align: 'left' });
        thedoc.font(normal).text( tools.formatAmount( param.quotationObj.quotationRealDeposite ), margin + TTCWLabel + TTCWDate, y, { width: TTCW - d, align: 'right' });
        y = thedoc.y + normalSize / 2;
        thedoc.lineWidth(1).rect(margin, startTTC, TTCWLabel + TTCW + TTCWDate, y - startTTC - 3).stroke("#000");
    } else {
        var deposite = 0;
        if (param.quotationObj.quotationDepositeForseen && param.quotationObj.quotationDepositeForseen > 0) deposite = param.quotationObj.quotationDepositeForseen;
        else {
            if (param.quotationObj.payCondObj && param.quotationObj.payCondObj.payCondTVA > 0) {
                deposite = param.quotationObj.payCondObj.payCondTVA / 100 * (total - param.quotationObj.quotationGlobalDiscount);
            }
        }
        if (deposite > 0) {
            // Forseen Deposite for Quotation
            thedoc.font(normal).text( "Acompte prévu", margin + d + TTCWDate, y, { width: TTCWLabel, align: 'left' });
            thedoc.font(normal).text( tools.formatAmount( deposite ), margin + TTCWLabel + TTCWDate, y, { width: TTCW - d, align: 'right' });
            y = thedoc.y + normalSize / 2;
            thedoc.lineWidth(1).rect(margin, startTTC, TTCWLabel + TTCW + TTCWDate, y - startTTC - 4).stroke("#000");
        }
    }

    if (param.quotationObj.quotationPaymentList && param.quotationObj.quotationPaymentList.length > 0) {
        for (var i = 0; i < param.quotationObj.quotationPaymentList.length; i++) {
            // date
            thedoc.font(normal).text( (new Date(param.quotationObj.quotationPaymentList[i].paymentDatePaid)).format("DD-MM-YYYY") , margin, y, { width: TTCWDate, align: 'center' });
            // type
            thedoc.font(normal).text( param.quotationObj.quotationPaymentList[i].payTypeObj.payTypeLabel , margin + d + TTCWDate , y, { width: TTCWLabel, align: 'left' });
            // amount
            thedoc.font(normal).text( tools.formatAmount( param.quotationObj.quotationPaymentList[i].paymentAmount ), margin + TTCWLabel + TTCWDate, y, { width: TTCW - d, align: 'right' });
            y = thedoc.y + normalSize / 2;
            thedoc.lineWidth(1).rect(margin, startTTC, TTCWLabel + TTCW + TTCWDate, y - startTTC - 4).stroke("#000");
        }
    }
    if (param.quotationObj.quotationType == 1 || param.quotationObj.quotationPaymentList && param.quotationObj.quotationPaymentList.length > 0) {
        thedoc.font(bold).text( "Restant dû", margin + d + TTCWDate, y, { width: TTCWLabel, align: 'left' });
        thedoc.font(bold).text( tools.formatAmount( total - param.quotationObj.quotationGlobalDiscount - param.quotationObj.quotationRealDeposite ), margin + TTCWLabel + TTCWDate, y, { width: TTCW - d, align: 'right' });
        y = thedoc.y + normalSize / 2;
        thedoc.lineWidth(1).rect(margin, startTTC, TTCWLabel + TTCW + TTCWDate, y - startTTC - 4).stroke("#000");
    }
};

var addTheFooter = function(thedoc, param) {
    thedoc.lineWidth(1).rect(margin, maxA4Y - margin - 5 * bigSize, maxA4X - 2 * margin, 5 * bigSize).fillAndStroke("#eee", "#eee");
    thedoc.fill("#000").fontSize(tinySize).font(normal).text( "Conformément à l'article de la loi Informatique et Libertés,\nvous disposez d'un droit d'accès et de rectification des données vous concernant et dont nous sommes les seuls utilisateurs", margin * 2, maxA4Y - margin - 4 * bigSize, { width: maxA4X - 4 * margin, align: 'center' });

    var footer = "";

    if (param.ownerObj.companyName.match(/\$(.*)\$(.*)\$/gi)) {
        var splitted = param.ownerObj.companyName.split(/\$(.*)\$(.*)\$/gi);
        footer += splitted[0] + splitted[2] + " " + param.ownerObj.companyLegal;
    } else {
        footer += param.ownerObj.companyName + " " + param.ownerObj.companyLegal;
    }
    if (param.ownerObj.addressLine1) footer += " - " + param.ownerObj.addressLine1;
    if (param.ownerObj.addressLine2) footer += " " + param.ownerObj.addressLine2;
    if (param.ownerObj.addressCP || param.ownerObj.addressCity) footer += " " + param.ownerObj.addressCP + (param.ownerObj.addressCP ? " " : "") + param.ownerObj.addressCity;
    footer += "\n";
    if (param.ownerObj.contactTel) {
        footer += param.ownerObj.contactTel;
    }
    if (param.ownerObj.contactMobile) {
        footer += (param.ownerObj.contactTel ? " - " :"") + param.ownerObj.contactMobile;
    }
    if (param.ownerObj.addressURL) footer += (param.ownerObj.contactTel || param.ownerObj.contactMobile ? " - " :"") + param.ownerObj.addressURL;
    thedoc.fill("#000").fontSize(tinySize).font(normal).text( footer , margin * 2, thedoc.y, { width: maxA4X - 4 * margin, align: 'center' });

};

module.exports = new Doc();

var util = require("util");
var moment = require("moment");
var numeral = require("numeral");

var Tools = function() {};

Tools.prototype.manageString = function(param) {
    // treat all fields that could came from user (FORM => post)

    // particular case of empty select
    if (param.personGender && param.personGender == "-") param.personGender = " ";

    // numeric fields
    var numFields = [   "productTTC", "productPaid", "TVAPercent", "ownerFactorOk", "ownerFactorNull",
                        "quotationGlobalDiscount", "quotationRealDeposite", "paymentAmount" ];
    // fields to UpperCase
    var uppFields = [   "personLastname", "companyAddressCity", "personAddressCity", "addressCity", "addressCountry",
                        "companyAddressCountry", "personAddressCountry" ];
    // fields to Capitalize
    var capFields = [   "personFirstname", "addressLine1", "companyAddressLine1", "personAddressLine1" ];
    // fields to trim
    var trimFields = [  "addressURL", "companyAddressURL", "personAddressURL", "addressLine2", "companyAddressLine2",
                        "personAddressLine2", "addressCP", "companyAddressCP", "personAddressCP",
                        "contactTel", "companyContactTel", "personContactTel", "companyName",
                        "contactFax", "companyContactFax", "personContactFax", "companyTVA",
                        "contactMobile", "companyContactMobile", "personContactMobile", "companySiret",
                        "contactMail", "companyContactMail", "personContactMail", "companyAPE", "customerNote",
                        "groupProductLabel", "payCondLabel", "payTypeLabel", "productLabel", "productCode", "productUnit", "TVALabel",
                        "quotationInternalNote", "quotationRef", "quotationCustomerNote", "ownerAPECity" ];

    // numeric
    for (var num in numFields) {
        var v = numFields[num];
        //console.log(" on traite N["+num+"] = "+v+" = " + param[v]);
        if (param[v]) param[v] = this.trim("" + param[v]).replace(",",".");
    }

    // Upper
    for (var up in uppFields) {
        var v = uppFields[up];
        //console.log(" on traite U["+up+"] = "+v+" = " + param[v]);
        if (param[v]) param[v] = this.trim("" + param[v]).toUpperCase();
    }

    // Capitalize
    for (var cap in capFields) {
        var v = capFields[cap];
        //console.log(" on traite C["+cap+"] = "+v+" = " + param[v]);
        if (param[v]) param[v] = this.capitalize("" + this.trim(param[v]));
    }

    // Trim
    for (var tr in trimFields) {
        var v = trimFields[tr];
        //console.log(" on traite T["+tr+"] = "+v+" = " + param[v]);
        if (param[v]) param[v] = this.trim("" + param[v]);
    }
};

Tools.prototype.capitalize = function(s) {
    var ret = "";
    var sSp = s.split(" ");
    for(var i = 0; i < sSp.length; i++) {
        var sDot = sSp[i].split(".");
        for(var j = 0; j < sDot.length; j++) {
            var sAp = sDot[j].split("'");
            for(var k = 0; k < sAp.length; k++) {
                if (sAp[k].length == 1)     ret += sAp[k].toLowerCase();
                else                        ret += sAp[k].substr(0, 1).toUpperCase() + sAp[k].substr(1).toLowerCase();
                if (sAp.length > 1 && k != sAp.length - 1) ret += "'";
            }
            if (sDot.length > 1 && j != sDot.length - 1) ret += ".";
        }
        if (sSp.length > 1 && i != sSp.length - 1) ret += " ";
    }
    return ret;
};

Tools.prototype.rounded = function(n) {
    if (!n && n!==0) return null;
    return Math.round(parseFloat(n) * 100) / 100;
};

Tools.prototype.formatAmount = function(n) {
    return numeral(parseFloat(n)).format("0.00") + " €";
};

Tools.prototype.formatAmountNoUnit = function(n) {
    if (!n && n!==0) return "";
    return numeral(parseFloat(n)).format("0.00");
};

Tools.prototype.formatProfit = function(n) {
    if (!n && n!==0) return "";
    return numeral(parseFloat(n)).format("0[.]00");
};

Tools.prototype.formatFactor = function(n) {
    if (!n && n!==0) return "";
    return numeral(parseFloat(n)).divide(100).format("+0[.]00 %");
};

Tools.prototype.getHT = function(ttc, tva) {
    return parseFloat(ttc) * 100 / (100 + parseFloat(tva));
};

Tools.prototype.getTTC = function(ht, tva) {
    return parseFloat(ht) * (1 + parseFloat(tva) / 100);
};

Tools.prototype.trim = function (s) {
    if (s == null) return "";
    else if (s == "") return "";
    else return s.replace(/^\s+|\s+$/g, '');
};
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};
// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function() {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
};

Date.prototype.format = function (mask) {
    if (!mask) return moment(this).format("L");
    else return moment(this).format(mask);
};

module.exports = new Tools();

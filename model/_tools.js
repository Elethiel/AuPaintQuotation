var util = require("util");

var Tools = function() {};

Tools.prototype.manageString = function(param) {
    // treat all fields that could came from user (FORM => post)
    
    // numeric fields
    var numFields = [   "productTTC", "productPaid", "TVAPercent", "ownerFactorOk", "ownerFactorNull" ];
    // fields to UpperCase
    var uppFields = [   "personLastName", "companyAddressCity", "personAddressCity", "addressCity", "addressCountry", 
                        "companyAddressCountry", "personAddressCountry" ];
    // fields to Capitalize
    var capFields = [   "personFirstName", "addressLine1", "companyAddressLine1", "personAddressLine1" ];
    // fields to trim
    var trimFields = [  "addressURL", "companyAddressURL", "personAddressURL", "addressLine2", "companyAddressLine2", 
                        "personAddressLine2", "addressCP", "companyAddressCP", "personAddressCP",
                        "contactTel", "companyContactTel", "personContactTel", "companyName", 
                        "contactFax", "companyContactFax", "personContactFax", "companyTVA", 
                        "contactMobile", "companyContactMobile", "personContactMobile", "companySiret", 
                        "contactMail", "companyContactMail", "personContactMail", "companyAPE", "customerNote",
                        "groupProductLabel", "payCondLabel", "payTypeLabel", "productLabel", "productCode", "productUnit", "TVALabel" ];    
    
    // numeric
    for (var num in numFields) {
        var v = numFields[num];
        if (param[v]) param[v] = this.trim(param[v]).replace(",",".");
    }

    // Upper
    for (var up in uppFields) {
        var v = uppFields[up];
        if (param[v]) param[v] = this.trim(param[v]).toUpperCase();
    }

    // Capitalize
    for (var cap in capFields) {
        var v = capFields[cap];
        if (param[v]) param[v] = this.capitalize(this.trim(param[v]));
    }
    
    // Trim
    for (var tr in trimFields) {
        var v = trimFields[tr];
        if (param[v]) param[v] = this.trim(param[v]);
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

Tools.prototype.trim = function (s) {
    return s.replace(/^\s+|\s+$/g, '');
};

module.exports = new Tools();

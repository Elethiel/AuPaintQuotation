var getHT = function(ttc, tva) {
    return parseFloat(ttc) * 100 / (100 + parseFloat(tva));
};

var getTTC = function(ht, tva) {
    return parseFloat(ht) * (1 + parseFloat(tva) / 100);
};

var formatAmount = function(n) {
    return numeral(parseFloat(n)).format("0.00") + " €";
};

var formatAmountNoUnit = function(n) {
    if (!n) return "";
    return numeral(parseFloat(n)).format("0.00");
};

var formatProfit = function(n) {
    if (!n) return "";
    return numeral(parseFloat(n)).format("0[.]00");
};

var formatFactor = function(n) {
    if (!n) return "";
    return numeral(parseFloat(n)).divide(100).format("+0[.]00 %");
};

var rounded = function(n) {
    if (!n) return null;
    return Math.round(parseFloat(n) * 100) / 100;
};

var unformat = function(n) {
    if (!n || n == "") return 0;
    if (typeof n == "string") {
        n = n.replace(",",".");
        if (n.charAt(0) == "+" || n.charAt(0) == "-") n = n.substr(1);
        if (n.slice(-1) == "%") n = n.substr(0, n.length - 1);
        if (n.slice(-1) == " ") n = n.substr(0, n.length - 1);
    }
    return n;
};

var getProfit = function(ht, ttc, paid) {
    ht = parseFloat(unformat(ht));
    ttc = parseFloat(unformat(ttc));
    paid = parseFloat(unformat(paid));
    if ((ht != "" && ht >= 0) || (ttc != "" && ttc >= 0)) {
        if (ht != "" && ht >= 0) return ht - paid;
        else return ttc - paid;
    } else return null;
};

var getProfitFactor = function(ht, ttc, paid) {
    ht = parseFloat(unformat(ht));
    ttc = parseFloat(unformat(ttc));
    paid = parseFloat(unformat(paid));
    if ((ht != "" && ht >= 0) || (ttc != "" && ttc >= 0)) {
        if (ht != "" && ht >= 0) { // HT available
            if (paid > 0) return ht * 100 / paid - 100;
            else return 100;
        } else { // ok, only TTC available...
            if (paid > 0) return ttc * 100 / paid - 100;
            else return 100;
        }
    } else return null;
};

var JStrim = function (s) {
    return s.replace(/^\s+|\s+$/g, '');
};

Date.prototype.format = function (mask) {
    if (!mask) return moment(this).format("L");
    else return moment(this).format(mask);
};
Date.prototype.getWeek = function() {
    return moment(this).format("WW");
};
Date.prototype.getWeekYear = function() {
    return moment(this).format("GGGG");
};
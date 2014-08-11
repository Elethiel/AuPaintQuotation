var getHT = function(ttc, tva) {
    return ttc * (1 - tva / 100);
};

var getTTC = function(ht, tva) {
    return ht * (1 + tva / 100);
};

var formatAmount = function(n) {
    return numeral(n).format("0.00") + " €";
};

var formatProfit = function(n) {
    return numeral(n).format("0[.]00");
};

var formatFactor = function(n) {
    return numeral(n).divide(100).format("+0[.]00 %");
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
    ht = unformat(ht);
    ttc = unformat(ttc);
    paid = unformat(paid);
    if ((ht != "" && ht >= 0) || (ttc != "" && ttc >= 0)) {
        if (ht != "" && ht >= 0) return ht - paid;
        else return ttc - paid;
    } else return null;
};

var getProfitFactor = function(ht, ttc, paid) {
    ht = unformat(ht);
    ttc = unformat(ttc);
    paid = unformat(paid);
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
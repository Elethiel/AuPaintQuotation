{"filter":false,"title":"stats.js","tooltip":"/client/js/stats.js","undoManager":{"mark":100,"position":100,"stack":[[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":32},"end":{"row":45,"column":33}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":46,"column":10},"end":{"row":46,"column":20}},"text":"parseFloat"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":46,"column":20},"end":{"row":46,"column":21}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":11},"end":{"row":47,"column":21}},"text":"parseFloat"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":21},"end":{"row":47,"column":22}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":36},"end":{"row":47,"column":37}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":46,"column":34},"end":{"row":46,"column":35}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":55,"column":9},"end":{"row":55,"column":19}},"text":"parseFloat"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":55,"column":19},"end":{"row":55,"column":20}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":55,"column":32},"end":{"row":55,"column":33}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":56,"column":23},"end":{"row":56,"column":24}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":24},"end":{"row":57,"column":25}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":11},"end":{"row":57,"column":21}},"text":"parseFloat"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":21},"end":{"row":57,"column":22}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":56,"column":10},"end":{"row":56,"column":20}},"text":"parseFloat"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":56,"column":20},"end":{"row":56,"column":21}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":1,"column":0},"end":{"row":1,"column":90}},"text":"    console.log(\"Calcul du HT = \" + ttc + \" et \" + tva + \" = \" + ttc * 100 / (100 + tva));"},{"action":"removeText","range":{"start":{"row":0,"column":32},"end":{"row":1,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":194,"column":0},"end":{"row":194,"column":2}},"text":"};"},{"action":"removeLines","range":{"start":{"row":71,"column":0},"end":{"row":194,"column":0}},"nl":"\n","lines":["","// *********","// DATE","// *********","/*"," * Date Format 1.2.3"," * (c) 2007-2009 Steven Levithan <stevenlevithan.com>"," * MIT license"," *"," * Includes enhancements by Scott Trenda <scott.trenda.net>"," * and Kris Kowal <cixar.com/~kris.kowal/>"," *"," * Accepts a date, a mask, or a date and a mask."," * Returns a formatted version of the given date."," * The date defaults to the current date/time."," * The mask defaults to dateFormat.masks.default."," */","","var dateFormat = function () {","    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\\1?|[LloSZ]|\"[^\"]*\"|'[^']*'/g,","        timezone = /\\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\\d{4})?)\\b/g,","        timezoneClip = /[^-+\\dA-Z]/g,","        pad = function (val, len) {","            val = String(val);","            len = len || 2;","            while (val.length < len) val = \"0\" + val;","            return val;","        };","","    // Regexes and supporting functions are cached through closure","    return function (date, mask, utc) {","        var dF = dateFormat;","","        // You can't provide utc if you skip other args (use the \"UTC:\" mask prefix)","        if (arguments.length == 1 && Object.prototype.toString.call(date) == \"[object String]\" && !/\\d/.test(date)) {","            mask = date;","            date = undefined;","        }","","        // Passing date through Date applies Date.parse, if necessary","        date = date ? new Date(date) : new Date;","        if (isNaN(date)) throw SyntaxError(\"invalid date\");","","        mask = String(dF.masks[mask] || mask || dF.masks[\"default\"]);","","        // Allow setting the utc argument via the mask","        if (mask.slice(0, 4) == \"UTC:\") {","            mask = mask.slice(4);","            utc = true;","        }","","        var _ = utc ? \"getUTC\" : \"get\",","            d = date[_ + \"Date\"](),","            D = date[_ + \"Day\"](),","            m = date[_ + \"Month\"](),","            y = date[_ + \"FullYear\"](),","            H = date[_ + \"Hours\"](),","            M = date[_ + \"Minutes\"](),","            s = date[_ + \"Seconds\"](),","            L = date[_ + \"Milliseconds\"](),","            o = utc ? 0 : date.getTimezoneOffset(),","            flags = {","                d:    d,","                dd:   pad(d),","                ddd:  dF.i18n.dayNames[D],","                dddd: dF.i18n.dayNames[D + 7],","                m:    m + 1,","                mm:   pad(m + 1),","                mmm:  dF.i18n.monthNames[m],","                mmmm: dF.i18n.monthNames[m + 12],","                yy:   String(y).slice(2),","                yyyy: y,","                h:    H % 12 || 12,","                hh:   pad(H % 12 || 12),","                H:    H,","                HH:   pad(H),","                M:    M,","                MM:   pad(M),","                s:    s,","                ss:   pad(s),","                l:    pad(L, 3),","                L:    pad(L > 99 ? Math.round(L / 10) : L),","                t:    H < 12 ? \"a\"  : \"p\",","                tt:   H < 12 ? \"am\" : \"pm\",","                T:    H < 12 ? \"A\"  : \"P\",","                TT:   H < 12 ? \"AM\" : \"PM\",","                Z:    utc ? \"UTC\" : (String(date).match(timezone) || [\"\"]).pop().replace(timezoneClip, \"\"),","                o:    (o > 0 ? \"-\" : \"+\") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),","                S:    [\"th\", \"st\", \"nd\", \"rd\"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]","            };","","        return mask.replace(token, function ($0) {","            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);","        });","    };","}();","","// Some common format strings","dateFormat.masks = {","    \"default\":      \"ddd mmm dd yyyy HH:MM:ss\",","    shortDate:      \"m/d/yy\",","    mediumDate:     \"mmm d, yyyy\",","    longDate:       \"mmmm d, yyyy\",","    fullDate:       \"dddd, mmmm d, yyyy\",","    shortTime:      \"h:MM TT\",","    mediumTime:     \"h:MM:ss TT\",","    longTime:       \"h:MM:ss TT Z\",","    isoDate:        \"yyyy-mm-dd\",","    isoTime:        \"HH:MM:ss\",","    isoDateTime:    \"yyyy-mm-dd'T'HH:MM:ss\",","    isoUtcDateTime: \"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'\"","};","","// Internationalization strings","dateFormat.i18n = {","    dayNames: [","        \"Sun\", \"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\",","        \"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Friday\", \"Saturday\"","    ],","    monthNames: [","        \"Jan\", \"Feb\", \"Mar\", \"Apr\", \"May\", \"Jun\", \"Jul\", \"Aug\", \"Sep\", \"Oct\", \"Nov\", \"Dec\",","        \"January\", \"February\", \"March\", \"April\", \"May\", \"June\", \"July\", \"August\", \"September\", \"October\", \"November\", \"December\"","    ]"]}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":70,"column":2},"end":{"row":71,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":72,"column":40},"end":{"row":72,"column":41}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":72,"column":39},"end":{"row":72,"column":40}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":72,"column":38},"end":{"row":72,"column":39}},"text":","}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":72,"column":38},"end":{"row":72,"column":39}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":72,"column":38},"end":{"row":72,"column":39}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":73,"column":0},"end":{"row":73,"column":39}},"text":"    return dateFormat(this, mask, utc);"},{"action":"removeText","range":{"start":{"row":72,"column":41},"end":{"row":73,"column":0}},"text":"\n"},{"action":"insertText","range":{"start":{"row":72,"column":41},"end":{"row":73,"column":0}},"text":"\n"},{"action":"insertLines","range":{"start":{"row":73,"column":0},"end":{"row":74,"column":0}},"lines":["    if (!mask) return moment(this).format(\"L\");"]},{"action":"insertText","range":{"start":{"row":74,"column":0},"end":{"row":74,"column":42}},"text":"    else return moment(this).format(mask);"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":76,"column":37},"end":{"row":77,"column":0}},"text":"\n"},{"action":"insertText","range":{"start":{"row":77,"column":0},"end":{"row":77,"column":4}},"text":"    "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":4},"end":{"row":77,"column":5}},"text":"r"},{"action":"insertText","range":{"start":{"row":77,"column":5},"end":{"row":77,"column":6}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":6},"end":{"row":77,"column":7}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":7},"end":{"row":77,"column":8}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":8},"end":{"row":77,"column":9}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":9},"end":{"row":77,"column":10}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":10},"end":{"row":77,"column":11}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":11},"end":{"row":77,"column":12}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":77,"column":11},"end":{"row":77,"column":12}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":11},"end":{"row":77,"column":12}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":12},"end":{"row":77,"column":13}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":13},"end":{"row":77,"column":14}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":14},"end":{"row":77,"column":15}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":15},"end":{"row":77,"column":16}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":16},"end":{"row":77,"column":17}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":17},"end":{"row":77,"column":18}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":18},"end":{"row":77,"column":19}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":19},"end":{"row":77,"column":20}},"text":"h"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":20},"end":{"row":77,"column":21}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":21},"end":{"row":77,"column":22}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":22},"end":{"row":77,"column":23}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":23},"end":{"row":77,"column":24}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":24},"end":{"row":77,"column":25}},"text":"f"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":25},"end":{"row":77,"column":26}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":26},"end":{"row":77,"column":27}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":27},"end":{"row":77,"column":28}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":28},"end":{"row":77,"column":29}},"text":"a"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":29},"end":{"row":77,"column":30}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":30},"end":{"row":77,"column":31}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":31},"end":{"row":77,"column":32}},"text":"\""}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":32},"end":{"row":77,"column":33}},"text":"W"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":33},"end":{"row":77,"column":34}},"text":"W"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":34},"end":{"row":77,"column":35}},"text":"\""}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":35},"end":{"row":77,"column":36}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":36},"end":{"row":77,"column":37}},"text":";"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":77,"column":37},"end":{"row":77,"column":38}},"text":","}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":77,"column":37},"end":{"row":77,"column":38}},"text":","}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":85,"column":0},"end":{"row":85,"column":110}},"text":"    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);"},{"action":"removeLines","range":{"start":{"row":78,"column":0},"end":{"row":85,"column":0}},"nl":"\n","lines":["    var date = new Date(this.getTime());","    date.setHours(0, 0, 0, 0);","    // Thursday in current week decides the year.","    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);","    // January 4 is always in week 1.","    var week1 = new Date(date.getFullYear(), 0, 4);","    // Adjust to Thursday in week 1 and count number of weeks from date to week1."]},{"action":"removeText","range":{"start":{"row":77,"column":37},"end":{"row":78,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":79,"column":0},"end":{"row":79,"column":73}},"text":"// Returns the four-digit year corresponding to the ISO week of the date."},{"action":"removeText","range":{"start":{"row":78,"column":2},"end":{"row":79,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":79,"column":41},"end":{"row":80,"column":0}},"text":"\n"},{"action":"insertText","range":{"start":{"row":80,"column":0},"end":{"row":80,"column":4}},"text":"    "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":4},"end":{"row":80,"column":5}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":5},"end":{"row":80,"column":6}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":6},"end":{"row":80,"column":7}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":7},"end":{"row":80,"column":8}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":8},"end":{"row":80,"column":9}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":9},"end":{"row":80,"column":10}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":10},"end":{"row":80,"column":11}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":11},"end":{"row":80,"column":12}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":12},"end":{"row":80,"column":13}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":13},"end":{"row":80,"column":14}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":14},"end":{"row":80,"column":15}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":15},"end":{"row":80,"column":16}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":16},"end":{"row":80,"column":17}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":17},"end":{"row":80,"column":18}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":18},"end":{"row":80,"column":19}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":19},"end":{"row":80,"column":20}},"text":"h"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":20},"end":{"row":80,"column":21}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":21},"end":{"row":80,"column":22}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":22},"end":{"row":80,"column":23}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":23},"end":{"row":80,"column":24}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":24},"end":{"row":80,"column":25}},"text":"f"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":25},"end":{"row":80,"column":26}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":26},"end":{"row":80,"column":27}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":27},"end":{"row":80,"column":28}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":28},"end":{"row":80,"column":29}},"text":"a"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":29},"end":{"row":80,"column":30}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":30},"end":{"row":80,"column":31}},"text":"("}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":31},"end":{"row":80,"column":32}},"text":"\""}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":32},"end":{"row":80,"column":33}},"text":"G"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":33},"end":{"row":80,"column":34}},"text":"G"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":34},"end":{"row":80,"column":35}},"text":"G"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":35},"end":{"row":80,"column":36}},"text":"G"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":36},"end":{"row":80,"column":37}},"text":"\""}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":37},"end":{"row":80,"column":38}},"text":")"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":80,"column":38},"end":{"row":80,"column":39}},"text":";"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":83,"column":0},"end":{"row":83,"column":30}},"text":"    return date.getFullYear();"},{"action":"removeLines","range":{"start":{"row":81,"column":0},"end":{"row":83,"column":0}},"nl":"\n","lines":["    var date = new Date(this.getTime());","    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);"]},{"action":"removeText","range":{"start":{"row":80,"column":39},"end":{"row":81,"column":0}},"text":"\n"}]}]]},"ace":{"folds":[],"scrolltop":1112.5,"scrollleft":0,"selection":{"start":{"row":80,"column":39},"end":{"row":80,"column":39},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":34,"state":"start","mode":"ace/mode/javascript"}},"timestamp":1412759976254,"hash":"68518f370728c1313efba3e0d25a61cca92d80f0"}
{"filter":false,"title":"datatables.title.js","tooltip":"/client/js/datatables.title.js","undoManager":{"mark":0,"position":0,"stack":[[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":0,"column":0},"end":{"row":1,"column":0}},"text":"\n"},{"action":"insertLines","range":{"start":{"row":1,"column":0},"end":{"row":14,"column":0}},"lines":["// plugin for datatables to sort images","jQuery.extend( jQuery.fn.dataTableExt.oSort, {","    \"title-string-pre\": function ( a ) {","        return a.match(\"title=\\\"(.*?)\\\"\")[1].toLowerCase();","    },","","    \"title-string-asc\": function ( a, b ) {","        return ((a < b) ? -1 : ((a > b) ? 1 : 0));","    },","","    \"title-string-desc\": function ( a, b ) {","        return ((a < b) ? 1 : ((a > b) ? -1 : 0));","    }"]},{"action":"insertText","range":{"start":{"row":14,"column":0},"end":{"row":14,"column":4}},"text":"} );"}]}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":14,"column":4},"end":{"row":14,"column":4},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1406984859008,"hash":"67492c311e1d63f7110ca005b28e13609a1df69c"}
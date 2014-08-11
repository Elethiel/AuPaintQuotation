{"filter":false,"title":"managementTab.js","tooltip":"/client/js/managementTab.js","undoManager":{"mark":3,"position":3,"stack":[[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":0,"column":0},"end":{"row":0,"column":30}},"text":"$(document).ready(function() {"},{"action":"insertText","range":{"start":{"row":0,"column":30},"end":{"row":1,"column":0}},"text":"\n"},{"action":"insertLines","range":{"start":{"row":1,"column":0},"end":{"row":61,"column":0}},"lines":["                $('#TVAtab').dataTable( {","                            \"jQueryUI\":         true,","                            \"language\":         { \"url\": \"./js/datatables_tva.lang\" },","                            \"dom\":              '<\"H\"r<\"#TVAHeader\">>t<\"F\"i>',","                            \"iDisplayLength\":   -1,","                            \"fnInitComplete\":   function() { $(\"#TVAHeader\").html(\"<b>TVA</b>\") },","                            \"columnDefs\": [","                                {","                                    \"width\": 20,","                                    \"targets\": 0","                                },","                                {","                                    \"sClass\": \"text-right\",","                                    \"render\": function ( data, type, row ) {","                                        return formatNumber(data,2) +'%';","                                    },","                                    \"targets\": 2","                                },","                                {","                                    \"sClass\": \"text-left\",","                                    \"targets\": 1","                                },","                                {","                                    \"width\": 36,","                                    \"targets\": 3,","                                    \"sortable\": false","                                }","                            ]","                } );","                ","                $('#addTVA').click( function() {","                    window.location.href='/addtva';","                });","                ","                $('#PayTypetab').dataTable( {","                            \"jQueryUI\":         true,","                            \"language\":         { \"url\": \"./js/datatables_paytype.lang\" },","                            \"dom\":              '<\"H\"r<\"#PayTypeHeader\">>t<\"F\"i>',","                            \"iDisplayLength\":   -1,","                            \"fnInitComplete\":   function() { $(\"#PayTypeHeader\").html(\"<b>Type de Paiement</b>\") },","                            \"columnDefs\": [","                                {","                                    \"width\": 20,","                                    \"targets\": 0","                                },","                                {","                                    \"sClass\": \"text-left\",","                                    \"targets\": 1","                                },","                                {","                                    \"width\": 36,","                                    \"targets\": 2,","                                    \"sortable\": false","                                }","                            ]","                } );","                ","                $('#addPayType').click( function() {","                    window.location.href='/addpaytype';","                });"]},{"action":"insertText","range":{"start":{"row":61,"column":0},"end":{"row":61,"column":15}},"text":"            });"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":1,"column":0},"end":{"row":1,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":2,"column":0},"end":{"row":2,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":3,"column":0},"end":{"row":3,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":4,"column":0},"end":{"row":4,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":5,"column":0},"end":{"row":5,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":6,"column":0},"end":{"row":6,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":7,"column":0},"end":{"row":7,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":8,"column":0},"end":{"row":8,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":9,"column":0},"end":{"row":9,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":10,"column":0},"end":{"row":10,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":11,"column":0},"end":{"row":11,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":12,"column":0},"end":{"row":12,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":13,"column":0},"end":{"row":13,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":14,"column":0},"end":{"row":14,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":15,"column":0},"end":{"row":15,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":16,"column":0},"end":{"row":16,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":17,"column":0},"end":{"row":17,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":18,"column":0},"end":{"row":18,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":19,"column":0},"end":{"row":19,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":20,"column":0},"end":{"row":20,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":21,"column":0},"end":{"row":21,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":22,"column":0},"end":{"row":22,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":23,"column":0},"end":{"row":23,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":24,"column":0},"end":{"row":24,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":25,"column":0},"end":{"row":25,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":26,"column":0},"end":{"row":26,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":27,"column":0},"end":{"row":27,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":28,"column":0},"end":{"row":28,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":29,"column":0},"end":{"row":29,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":30,"column":0},"end":{"row":30,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":31,"column":0},"end":{"row":31,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":32,"column":0},"end":{"row":32,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":33,"column":0},"end":{"row":33,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":34,"column":0},"end":{"row":34,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":35,"column":0},"end":{"row":35,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":36,"column":0},"end":{"row":36,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":37,"column":0},"end":{"row":37,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":38,"column":0},"end":{"row":38,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":39,"column":0},"end":{"row":39,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":40,"column":0},"end":{"row":40,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":41,"column":0},"end":{"row":41,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":42,"column":0},"end":{"row":42,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":43,"column":0},"end":{"row":43,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":44,"column":0},"end":{"row":44,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":45,"column":0},"end":{"row":45,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":46,"column":0},"end":{"row":46,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":47,"column":0},"end":{"row":47,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":48,"column":0},"end":{"row":48,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":49,"column":0},"end":{"row":49,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":50,"column":0},"end":{"row":50,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":51,"column":0},"end":{"row":51,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":52,"column":0},"end":{"row":52,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":53,"column":0},"end":{"row":53,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":54,"column":0},"end":{"row":54,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":55,"column":0},"end":{"row":55,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":56,"column":0},"end":{"row":56,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":57,"column":0},"end":{"row":57,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":58,"column":0},"end":{"row":58,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":59,"column":0},"end":{"row":59,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":60,"column":0},"end":{"row":60,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":61,"column":0},"end":{"row":61,"column":4}},"text":"    "}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":1,"column":0},"end":{"row":1,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":2,"column":0},"end":{"row":2,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":3,"column":0},"end":{"row":3,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":4,"column":0},"end":{"row":4,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":5,"column":0},"end":{"row":5,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":6,"column":0},"end":{"row":6,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":7,"column":0},"end":{"row":7,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":8,"column":0},"end":{"row":8,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":9,"column":0},"end":{"row":9,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":10,"column":0},"end":{"row":10,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":11,"column":0},"end":{"row":11,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":12,"column":0},"end":{"row":12,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":13,"column":0},"end":{"row":13,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":14,"column":0},"end":{"row":14,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":15,"column":0},"end":{"row":15,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":16,"column":0},"end":{"row":16,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":17,"column":0},"end":{"row":17,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":18,"column":0},"end":{"row":18,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":19,"column":0},"end":{"row":19,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":20,"column":0},"end":{"row":20,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":21,"column":0},"end":{"row":21,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":22,"column":0},"end":{"row":22,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":23,"column":0},"end":{"row":23,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":24,"column":0},"end":{"row":24,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":25,"column":0},"end":{"row":25,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":26,"column":0},"end":{"row":26,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":27,"column":0},"end":{"row":27,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":28,"column":0},"end":{"row":28,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":29,"column":0},"end":{"row":29,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":30,"column":0},"end":{"row":30,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":31,"column":0},"end":{"row":31,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":32,"column":0},"end":{"row":32,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":33,"column":0},"end":{"row":33,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":34,"column":0},"end":{"row":34,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":35,"column":0},"end":{"row":35,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":36,"column":0},"end":{"row":36,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":37,"column":0},"end":{"row":37,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":38,"column":0},"end":{"row":38,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":39,"column":0},"end":{"row":39,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":40,"column":0},"end":{"row":40,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":41,"column":0},"end":{"row":41,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":42,"column":0},"end":{"row":42,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":43,"column":0},"end":{"row":43,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":44,"column":0},"end":{"row":44,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":45,"column":0},"end":{"row":45,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":46,"column":0},"end":{"row":46,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":47,"column":0},"end":{"row":47,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":48,"column":0},"end":{"row":48,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":49,"column":0},"end":{"row":49,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":50,"column":0},"end":{"row":50,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":51,"column":0},"end":{"row":51,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":52,"column":0},"end":{"row":52,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":53,"column":0},"end":{"row":53,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":54,"column":0},"end":{"row":54,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":55,"column":0},"end":{"row":55,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":56,"column":0},"end":{"row":56,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":57,"column":0},"end":{"row":57,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":58,"column":0},"end":{"row":58,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":59,"column":0},"end":{"row":59,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":60,"column":0},"end":{"row":60,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":61,"column":0},"end":{"row":61,"column":4}},"text":"    "}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":1,"column":0},"end":{"row":1,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":2,"column":0},"end":{"row":2,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":3,"column":0},"end":{"row":3,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":4,"column":0},"end":{"row":4,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":5,"column":0},"end":{"row":5,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":6,"column":0},"end":{"row":6,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":7,"column":0},"end":{"row":7,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":8,"column":0},"end":{"row":8,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":9,"column":0},"end":{"row":9,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":10,"column":0},"end":{"row":10,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":11,"column":0},"end":{"row":11,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":12,"column":0},"end":{"row":12,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":13,"column":0},"end":{"row":13,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":14,"column":0},"end":{"row":14,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":15,"column":0},"end":{"row":15,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":16,"column":0},"end":{"row":16,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":17,"column":0},"end":{"row":17,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":18,"column":0},"end":{"row":18,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":19,"column":0},"end":{"row":19,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":20,"column":0},"end":{"row":20,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":21,"column":0},"end":{"row":21,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":22,"column":0},"end":{"row":22,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":23,"column":0},"end":{"row":23,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":24,"column":0},"end":{"row":24,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":25,"column":0},"end":{"row":25,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":26,"column":0},"end":{"row":26,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":27,"column":0},"end":{"row":27,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":28,"column":0},"end":{"row":28,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":29,"column":0},"end":{"row":29,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":30,"column":0},"end":{"row":30,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":31,"column":0},"end":{"row":31,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":32,"column":0},"end":{"row":32,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":33,"column":0},"end":{"row":33,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":34,"column":0},"end":{"row":34,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":35,"column":0},"end":{"row":35,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":36,"column":0},"end":{"row":36,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":37,"column":0},"end":{"row":37,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":38,"column":0},"end":{"row":38,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":39,"column":0},"end":{"row":39,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":40,"column":0},"end":{"row":40,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":41,"column":0},"end":{"row":41,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":42,"column":0},"end":{"row":42,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":43,"column":0},"end":{"row":43,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":44,"column":0},"end":{"row":44,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":45,"column":0},"end":{"row":45,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":46,"column":0},"end":{"row":46,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":47,"column":0},"end":{"row":47,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":48,"column":0},"end":{"row":48,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":49,"column":0},"end":{"row":49,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":50,"column":0},"end":{"row":50,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":51,"column":0},"end":{"row":51,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":52,"column":0},"end":{"row":52,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":53,"column":0},"end":{"row":53,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":54,"column":0},"end":{"row":54,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":55,"column":0},"end":{"row":55,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":56,"column":0},"end":{"row":56,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":57,"column":0},"end":{"row":57,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":58,"column":0},"end":{"row":58,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":59,"column":0},"end":{"row":59,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":60,"column":0},"end":{"row":60,"column":4}},"text":"    "},{"action":"removeText","range":{"start":{"row":61,"column":0},"end":{"row":61,"column":4}},"text":"    "}]}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":12,"column":21},"end":{"row":12,"column":21},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":33,"state":"start","mode":"ace/mode/javascript"}},"timestamp":1406209746768,"hash":"6845532149836c86b6748a1b7b2aa44a79860d3e"}
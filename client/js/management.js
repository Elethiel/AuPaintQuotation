var initTVA = function() {
    $('#TVAtab').dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_tva.lang" },
                "dom":              'T<"H"r<"#TVAHeader">>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#TVAHeader").html("<b>TVA</b>") },
                "tableTools": {
                                    "sSwfPath": "./libs/datatables/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
                                    "aButtons": [
                                                    {
                                                        "sExtends":    "collection",
                                                        "sButtonText": "Export",
                                                        "aButtons":    [ "xls", "pdf" ]
                                                    }
                                                ]
                }, 
                "order":            [[ 2, "asc" ]],
                "columnDefs": [
                    {
                        "width": 20,
                        "targets":  [0]
                    },
                    {
                        "sClass": "text-right",
                        "render": function ( data, type, row ) {
                            return numeral(data).divide(100).format('0.00%');
                        },
                        "targets": [2]
                    },
                    {
                        "sClass": "text-left",
                        "targets": [1]
                    },
                    {
                        "width": 36,
                        "targets": [3],
                        "sortable": false,
                        "searchable": false
                    }
                ]
    } );
    
    $('#addTVA').click( function() {
        window.location.href='/tva';
    });
};

var initGroupProduct = function() {
    $('#groupProducttab').dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_groupproduct.lang" },
                "dom":              '<T<"H"r<"#groupProductHeader">>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#groupProductHeader").html("<b>Catégorie de Prestation</b>") },
                "tableTools": {
                                    "sSwfPath": "./libs/datatables/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
                                    "aButtons": [
                                                    {
                                                        "sExtends":    "collection",
                                                        "sButtonText": "Export",
                                                        "aButtons":    [ "xls", "pdf" ]
                                                    }
                                                ]
                }, 
                "order":            [[ 2, "asc" ]],
                "columnDefs": [
                    {
                        "width": 20,
                        "targets": [0]
                    },
                    {
                        "visible": false,
                        "searchable": false,
                        "targets": [1]
                    },
                    {
                        "sClass": "text-left",
                        "render": function ( data, type, row ) {
                            return "<table class='nothing' border='0'><tr><td width='80' class='text-center'>" + row[1] + "</td><td class='text-left'>" + data + "</td></tr></table>";
                        },
                        "targets": [2]
                    },
                    {
                        "width": 36,
                        "targets": [4],
                        "sortable": false,
                        "searchable": false
                    }
                ]
    } );
    
    $('#addGroupProduct').click( function() {
        window.location.href='/groupProduct';
    });
};

var initPayType = function() {
    $('#PayTypetab').dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_paytype.lang" },
                "dom":              'T<"H"r<"#PayTypeHeader">>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#PayTypeHeader").html("<b>Types de Paiement</b>") },
                "tableTools": {
                                    "sSwfPath": "./libs/datatables/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
                                    "aButtons": [
                                                    {
                                                        "sExtends":    "collection",
                                                        "sButtonText": "Export",
                                                        "aButtons":    [ "xls", "pdf" ]
                                                    }
                                                ]
                }, 
                "order":            [[ 1, "asc" ]],
                "columnDefs": [
                    {
                        "width": 20,
                        "targets": [0]
                    },
                    {
                        "sClass": "text-left",
                        "targets": [1]
                    },
                    {
                        "width": 36,
                        "targets": [2],
                        "sortable": false,
                        "searchable": false
                    }
                ]
    } );
    
    $('#addPayType').click( function() {
        window.location.href='/paytype';
    });
};

var initPayCond = function() {
    $('#PayCondtab').dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_paycond.lang" },
                "dom":              'T<"H"r<"#PayCondHeader">>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#PayCondHeader").html("<b>Conditions de Paiement</b>") },
                "tableTools": {
                                    "sSwfPath": "./libs/datatables/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
                                    "aButtons": [
                                                    {
                                                        "sExtends":    "collection",
                                                        "sButtonText": "Export",
                                                        "aButtons":    [ "xls", "pdf" ]
                                                    }
                                                ]
                }, 
                "order":            [[ 1, "asc" ]],
                "columnDefs": [
                    {
                        "width": 20,
                        "targets": [0]
                    },
                    {
                        "sClass": "text-left",
                        "targets": [1]
                    },
                    {
                        "width": 36,
                        "targets": [2],
                        "sortable": false,
                        "searchable": false
                    }
                ]
    } );
    
    $('#addPayCond').click( function() {
        window.location.href='/paycond';
    });
};

var initTabs = function() {
    initTVA();
    initGroupProduct();
    initPayType();
    initPayCond();
    // update/delete for TVA
    maxTVA = $("#maxTVA").val();
    if (maxTVA && maxTVA > 0) {
        for (var i = 0; i < maxTVA; i++) {
            $("#delTVA" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                // update the content of popup before showing
                popup.updateForDelete($("#labelTVA" + n).html(), "cette TVA", "/tvaDel?TVAId=", $("#idTVA" + n).html());
                popup.show();
            });
        }
    }
    // update/delete for groupProduct
    maxGroupProduct = $("#maxGroupProduct").val();
    if (maxGroupProduct && maxGroupProduct > 0) {
        for (var i = 0; i < maxGroupProduct; i++) {
            $("#delGroupProduct" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                // update the content of popup before showing
                popup.updateForDelete($("#labelGroupProduct" + n).html(), "cette Catégorie de Produit", "/groupProductDel?groupProductId=", $("#idGroupProduct" + n).html());
                popup.show();
            });
        }
    }
    // update/delete for payType
    maxPayType = $("#maxPayType").val();
    if (maxPayType && maxPayType > 0) {
        for (var i = 0; i < maxPayType; i++) {
            $("#delPayType" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                // update the content of popup before showing
                popup.updateForDelete($("#labelPayType" + n).html(), "ce Type de Paiement", "/payTypeDel?payTypeId=", $("#idPayType" + n).html());
                popup.show();
            });
        }
    }
    // update/delete for payCond
    maxPayCond = $("#maxPayCond").val();
    if (maxPayCond && maxPayCond > 0) {
        for (var i = 0; i < maxPayCond; i++) {
            $("#delPayCond" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                // update the content of popup before showing
                popup.updateForDelete($("#labelPayCond" + n).html(), "cette Condition de Paiement", "/payCondDel?payCondId=", $("#idPayCond" + n).html());
                popup.show();
            });
        }
    }
};
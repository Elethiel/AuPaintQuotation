
var productInitTab = function () {
    $("#producttab").dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_product.lang" },
                "dom":              '<T<"H"r<"#ProductHeader">>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#ProductHeader").html("<b>Prestations</b>") },
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
                "order":            [[ 2, "asc" ], [3, "asc"]],
                "columnDefs": [
                    {
                        "width": 20,
                        "targets": 0
                    },
                    {
                        "sClass": "text-left",
                        "targets": [1, 2]
                    },
                    {
                        "width": 80,
                        "targets": [1]
                    },
                    {
                        "type": "title-string",
                        "targets": [2]
                    },
                    {
                        "sClass": "text-left text-small",
                        "render": function ( data, type, row ) {
                            return getProfitIm(row[5], row[4], row[9], row[10], row[11]) + " &nbsp; " + data + (row[6] != "" ? " (/" + row[6] + ")" :"");
                        },
                        "targets": [3]
                    },
                    {
                        "width": 60,
                        "render": function ( data, type, row ) {
                            return numeral(data).format('0.00') + "&nbsp;€";
                        },
                        "sClass": "text-right",
                        "targets": [4]
                    },
                    {
                        "width": 80,
                        "render": function ( data, type, row ) {
                            return numeral(data).format('0.00') + "&nbsp;€ " +
                                    "<a href='#' data-placement='bottom' " +
                                    "data-tooltipsmall='TTC: " + formatAmount(data) +
                                    "\nHT: " + formatAmount(getHT(data, row[9])) +
                                    "\nMarge: " + formatAmount(getProfit(getHT(data, row[9]), data, row[4])) +
                                    "\nFacteur: " + formatFactor(getProfitFactor(getHT(data, row[9]), data, row[4])) +
                                    "'> " +
                                    " <span class='glyphicon glyphicon-info-sign'></span></a> ";
                        },
                        "sClass": "text-right",
                        "targets": [5]
                    },
                    {
                        "visible": false,
                        "searchable": false,
                        "targets": [6, 9, 10, 11]
                    },
                    {
                        "width": 80,
                        "sClass": "text-center",
                        "targets": [7]
                    },
                    {
                        "width": 36,
                        "targets": [8] ,
                        "sortable": false,
                        "searchable": false
                    }
                ]
    } );

    $("#addProduct").click( function() {
        window.location.href='/product';
    });
    // update/delete for Product
    maxProduct = $("#maxProduct").val();
    if (maxProduct && maxProduct > 0) {
        for (var i = 0; i < maxProduct; i++) {
            $("#delProduct" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                // update the content of popup before showing
                popup.updateForDelete($("#labelProduct" + n).html(), "cette Prestation", "/productDel?productId=", $("#idProduct" + n).html());
                popup.show();
                return false;
            });
        }
    }
};

var fOk = null;
var fNull = null;

var getFactorStatus = function(f, fOk, fNull) {
    if (fOk || fNull) {
        if (fOk) {
            if (f > fOk)                   return "ok";
            else if (fNull && f > fNull)   return "n";
            else                           return "nok";
        } else if (f > fNull)              return "n";
        else                               return "nok";
    }
    return null;
};

var getProfitIm = function(ttc, paid, tva, ffok, ffnull) {
    if (ffok) fOk = ffok;
    if (ffnull) fNull = ffnull;
    ttc = unformat(ttc);
    paid = unformat(paid);
    ht = getHT(ttc, tva);
    switch (getFactorStatus(getProfitFactor(ht, ttc, paid), fOk, fNull)) {
        case "ok" :     return '<a href="#" data-tooltipsmall="Très Rentable (' + formatFactor(getProfitFactor(ht, ttc, paid)) + ')" data-placement="bottom"><span id="factorok" class="glyphicon glyphicon-thumbs-up green"></span></a>'; break;
        case "n" :      return '<a href="#" data-tooltipsmall="Rentable (' + formatFactor(getProfitFactor(ht, ttc, paid)) + ')" data-placement="bottom"><span id="factornull" class="glyphicon glyphicon-hand-right black"></span></a>'; break;
        case "nok" :    return '<a href="#" data-tooltipsmall="Peu ou pas Rentable (' + formatFactor(getProfitFactor(ht, ttc, paid)) + ')" data-placement="bottom"><span id="factornok" class="glyphicon glyphicon-thumbs-down red"></span></a>'; break;
        default: 
    }
};

var productValidator = function(ffok, ffnull) {
    if (ffok) fOk = ffok;
    if (ffnull) fNull = ffnull;
    return function() {
        // take into account hidden fields for this form (TVA is hidden when select a group product)
        $("#productForm").bootstrapValidator( { excluded: [] } );
        $('#backBut').click(function() {
            window.location.href='/productMenu';
        });
        // select box "groupProduct"
        for (var i = 0; i < $("#maxGroupList").val(); i++) {
            $("#optionGroup" + i).click(productGroupSelect);
        }
        $("#productTTC").keyup(productPriceUpdateFromTTC);
        $("#productHT").keyup(productPriceUpdateFromHT);
        $("#productPaid").keyup(checkProfit);
        if (!$("#productId").val() || $("#productId").val() == "") $("#profit").hide();
        if ($("#productTTC").val() && $("#groupProductTVAPercent").val()) productPriceUpdateFromTTC();
        else if ($("#productHT").val() && $("#groupProductTVAPercent").val()) productPriceUpdateFromHT();
        checkProfit();
    }
};


var checkProfit = function() {
    var ht = unformat($("#productHT").val());
    var ttc = unformat($("#productTTC").val());
    var paid = unformat($("#productPaid").val());
    $("#factorok").hide();
    $("#factornok").hide();
    $("#factornull").hide();
    if ($("#productPaid").val() != "" && ($("#productHT").val() != "" || $("#productTTC").val() != "" )) {
        if (ht >= 0 || ttc >= 0) {
            $("#productProfit").val(formatProfit(getProfit(ht, ttc, paid)));
            $("#productProfitFactor").val(formatFactor(getProfitFactor(ht, ttc, paid)));
            var factor = unformat($("#productProfitFactor").val());
            switch (getFactorStatus(unformat($("#productProfitFactor").val()), fOk, fNull)) {
                case "ok" :     $("#factorok").show(); break;
                case "n" :      $("#factornull").show(); break;
                case "nok" :    $("#factornok").show(); break;
                default: 
            }
            $("#profit").show();
        } else $("#profit").hide();
    } else $("#profit").hide();
};

var productGroupSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring(11);
    // update hidden field
    $("#groupProductId").val($("#optionGroupId" + i).val());
    $("#groupProductTVAPercent").val($("#TVAPercent" + i).val());
    // update text to let know to the user what field is selected
    $("#selectGroup").html($(this).html());
    productPriceUpdateFromGroupProduct();
    $("#productForm").bootstrapValidator("revalidateField", "groupProductTVAPercent");
    $("#selectDrop").click();
    return false;
};

var lastMode = null;

var productPriceUpdateFromGroupProduct = function() {
    productPriceUpdate(lastMode);
};

var productPriceUpdateFromTTC = function() {
    productPriceUpdate(1);
};

var productPriceUpdateFromHT = function() {
    productPriceUpdate(2);
};

var productPriceUpdate = function(mode) {
    lastMode = mode;
    // retrieve Price fields
    var ttc = unformat($("#productTTC").val());
    var ht = unformat($("#productHT").val());
    
    // retrieve TVA
    var tva = $("#groupProductTVAPercent");
    if (tva.val() != "") {
        if (mode == 1) {
            // ttc to ht
            if (ttc >= 0) {
                $("#productHT").val(formatProfit(getHT(ttc, tva.val())));
                $("#productForm").bootstrapValidator("revalidateField", "productHT");
            }
        } else if (mode == 2) {
            // ht to ttc
            if (ht >= 0) {
                $("#productTTC").val(formatProfit(getTTC(ht, tva.val())));
                $("#productForm").bootstrapValidator("revalidateField", "productTTC");
            }
        } else {
            // default to ttc > ht
            if (ttc >= 0) {
                $("#productHT").val(formatProfit(getHT(ttc, tva.val())));
                $("#productForm").bootstrapValidator("revalidateField", "productHT");
            } else if (ht >= 0) {
                $("#productTTC").val(formatProfit(getTTC(ht, tva.val())));
                $("#productForm").bootstrapValidator("revalidateField", "productTTC");
            }
        }
    }
    checkProfit();
};
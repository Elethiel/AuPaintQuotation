
var quotationInitTab = function () {

    $("#addQuotation").click( function() {
        window.location.href='/quotation?type=-1';
    });

    $("#addInvoice").click( function() {
        window.location.href='/quotation?type=1';
    });
};

var quotationValidator = function() {
    $('#backButMain').click(function() {
        window.location.href='/quotationMenu';
    });

    customerInit();
    prestaInit();
};


// ********************************************************************************************************
// CUSTOMER
// ********************************************************************************************************
var customerInit = function() {


    $("#customerexisttab").dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_customer.lang" },
                "dom":              '<<"H"r<"#CustomerHeader">f>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#CustomerHeader").html("<b>Clients</b>") },
                "order":            [[ 1, "asc" ]],
                "columnDefs": [
                    {
                        "width": 40,
                        "type": "title-string",
                        "targets": [0]
                    },
                    {
                        "sClass": "text-left",
                        "targets": [1]
                    },
                    {
                        "width": 36,
                        "targets": [2] ,
                        "sortable": false,
                        "searchable": false
                    }
                ]
    } );

    // the "SELECT CUSTOMER" button
    if (customerList.length > 0) {
        for (var i = 0; i < customerList.length; i++) {
            // select
            $("#selectCust" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                quotationObj.customerObj = customerList[n];
                checkCustomerSelectedField();
                return false;
            });
        }
    }

    // unselect
    $("#unselectCust").click( function() {
        quotationObj.customerObj = null;
        checkCustomerSelectedField();
        return false;
    });

    // add new customer button
    $("#addNewCust").click( addNewPopupCust );

    // popup NEW content
    if ($("#popupContentNewCust").html() != "") {
        popup.updateJS("Nouveau Client", $("#popupContentNewCust").html(), "Annuler", "Sélectionner", validNewCustomerHandler, true);
        $("#popupContentNewCust").html("");
    }

    // select box "customer Type"
    for (var i = 0; i < $("#maxquotationCustomerTypeList").val(); i++) {
        $("#optionquotationCustomerType" + i).click(quotationCustomerTypeSelect);
    }

    // select box "company legal"
    for (var i = 0; i < $("#maxquotationCompanyLegalList").val(); i++) {
        $("#optionquotationCompanyLegal" + i).click(quotationLegalSelect);
    }

    // select box "person Gender"
    for (var i = 0; i < $("#maxquotationPersonGenderList").val(); i++) {
        $("#optionquotationPersonGender" + i).click(quotationGenderSelect);
    }

    $.fn.bootstrapValidator.validators.atLeastOne = {
        validate: function(validator, $field, options) {
            if ($field.val().replace(/^\s+|\s+$/gm,'') != "") return true; // at least one not null OK
            if ($field.attr("id") === "quotationPersonFirstname") {
                if ($("#quotationPersonLastname").val() != "") return true;
            } else if ($field.attr("id") === "quotationPersonLastname") {
                if ($("#quotationPersonFirstname").val() != "") return true;
            }
            return false;
        }
    };
    $("#popupForm").bootstrapValidator( { excluded: [ function($field, validator) {
            if ($("#quotationCustomerType").val() == -1) {
                return false; // valide all if "type company"
            } else { // if not selected or "type person"
                if (($field.attr("id") == "quotationCompanyLegal") || ($field.attr("id") == "quotationCompanyName")) {
                    return true;
                }
                return false;
            }
        } ] ,
        fields: {
                quotationPersonFirstname: {
                        validators: {
                            atLeastOne: { message: "Merci de remplir au moins l'un des deux champs !" }
                        }
                    },
                quotationPersonLastname: {
                        validators: {
                            atLeastOne: { message: "Merci de remplir au moins l'un des deux champs !" }
                        }
                    }
                }
        }
    );

    $("#quotationCompanyName").keyup(function(){
        $("#popupForm").bootstrapValidator("revalidateField", "quotationCompanyName");
    });
    $("#quotationPersonFirstname").keyup(function(){
        $("#popupForm").bootstrapValidator("revalidateField", "quotationPersonLastname");
    });
    $("#quotationPersonLastname").keyup(function(){
        $("#popupForm").bootstrapValidator("revalidateField", "quotationPersonFirstname");
    });
};

var checkCustomerSelectedField = function() {
    if (quotationObj.customerObj == null) {
        $("#quotationSelectedCustomer").html("");
        $("#quotationSelectedCustomer").removeClass("midfield");
        $("#unselectCust").removeClass("show");
        $("#unselectCust").hide();
    } else {
        $("#quotationSelectedCustomer").html("<b>" + quotationObj.customerObj.displayName + (quotationObj.customerObj.customerId ? "" : " (***)") + "</b>");
        $("#quotationSelectedCustomer").addClass("midfield");
        $("#unselectCust").removeClass("hide");
        $("#unselectCust").show();
    }
    checkValidityCustomer();
};

var checkValidityCustomer = function() {
    if (quotationObj.customerObj != null) { // someone selected
        checkCust();
    } else { // nothing selected
        uncheckCust();
    }
};

var checkCust = function() {
    $("#checkCustOk").removeClass("hide");
    $("#checkCustOk").show();
    $("#checkCustNok").hide();
};

var uncheckCust = function() {
    $("#checkCustNok").removeClass("hide");
    $("#checkCustNok").show();
    $("#checkCustOk").hide();
};

var validNewCustomerHandler = function() {
    $("#popupForm").bootstrapValidator("validate");
    var fields = $("#popupForm").data("bootstrapValidator").getInvalidFields();
    if (fields.length > 0) {
        if (fields[0].type == "hidden") $("#select" + fields[0].id).get(0).scrollIntoView()
        else fields[0].scrollIntoView();
        popup.show();
    } else {
        alert("ah ah !");
        popup.hide();
    }
    return false;
};

// new to create a popup with the form in order to define the new customer Obj and to select it
var addNewPopupCust = function () {
    popup.show();
    return false;
};


var quotationCustomerTypeSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optionquotationCustomerType".length);
    // update hidden field
    $("#quotationCustomerType").val($("#optionvalquotationCustomerType" + i).val());
    $("#selectquotationCustomerType").html($(this).html());
    if (i == 0) clickOnMoral();
    else if (i == 1) clickOnPhysical();
    $("#popupForm").bootstrapValidator("revalidateField", "quotationCustomerType");
    $("#selectDropquotationCustomerType").click();
    return false;
};

var quotationLegalSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optionquotationCompanyLegal".length);
    $("#quotationCompanyLegal").val($("#optionvalquotationCompanyLegal" + i).val());
    $("#selectquotationCompanyLegal").html($(this).html());
    $("#popupForm").bootstrapValidator("revalidateField", "quotationCompanyLegal");
    $("#selectDropquotationCompanyLegal").click();
    return false;
};

var quotationGenderSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optionquotationPersonGender".length);
    $("#quotationPersonGender").val($("#optionvalquotationPersonGender" + i).val());
    $("#selectquotationPersonGender").html($(this).html());
    $("#popupForm").bootstrapValidator("revalidateField", "quotationPersonGender");
    $("#selectDropquotationPersonGender").click();
    return false;
};

// ********************************************************************************************************
// PRESTATION
// ********************************************************************************************************

var prestaInit = function() {
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

    // buttons of system action
    $("#addEmpty").click(addEmpty);
    $("#addComm").click(function () {

    });
    $("#addST").click(function () {

    });
};

// remove empty line if needed
// or add empty line
var checkEmpty = function() {
    if ($("#prestatab > tbody:last > tr:first")) {
        // remove the empty "no data" row
        $("#prestatab > tbody:last > tr:first").find("td").each(function() {
            var ord = $(this).find("input[id^=ord]");
            if (ord && ord.length == 0) {
                // the empty lines ?
                $(this).remove();
            }
        });
    } else {
        // no more line in table
    }
};

var addEmpty = function() {
    // get last line
    var i = getLastRowID();
    i = i + 1;
    alert("on insert en " + i);
    var newRow = "<tr><td colspan='6'>"
    newRow += "<input type='hidden' id='ord" + i + "' value='" + i + "'/>";   // order
    newRow += "<input type='hidden' id='type" + i + "' value='1'>";           // type "field"
    newRow += "<input type='hidden' id='val" + i + "' value=''>";             // value empty
    newRow += "&nbsp;</td></tr>";
    $("#prestatab > tbody:last").append(newRow);
    checkEmpty();
    return false;
};

// get the last presta rows ID
var getLastRowID = function() {
    $("#prestatab > tbody:last > tr:last").find("td").each(function() {
        var ord = $(this).find("input[id^=ord]");
        if (ord && ord.length > 0) {
            ord = ord[0].id; // first one, and it's id only
            return ord.substring(3);
        }
    });
    return 999;
};

var firstTime = true;

var quotationInitTab = function () {
    $("#quotationtab").dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_quotation.lang" },
                "dom":              '<<"H"r<"#QuotationHeader">f>t<"F"i>',
                "iDisplayLength":   -1,
                "scrollY":          "400px",
                "fnInitComplete":   function() { $("#QuotationHeader").html("<b>Devis et Factures</b>") },
                "order":            [ [ 4, "desc" ] , [ 3, "desc" ] ],
                "columnDefs": [
                    {
                        "className": "text-small",
                        "width": 15,
                        "targets": 0
                    },
                    {
                        "className": "text-left text-small",
                        "targets" : [1, 2, 6]
                    },
                    {
                        "className": "text-center text-small",
                        "render": function ( data, type, row ) {
                            return data ? (new Date(data)).format("DD-MM-YYYY") : "";
                        },
                        "targets": [3, 5]
                    },
                    {
                        "className": "text-center text-small",
                        "render": function ( data, type, row ) {
                            return data ? (new Date(data)).format("DD-MM-YYYY HH:mm") : "";
                        },
                        "targets": [4]
                    },
                    {
                        "visible": false,
                        "searchable": false,
                        "targets": [4]
                    },
                    {
                        "targets": [6],
                        "render": function( data, type, row) {
                            return calculateStatusText(quotationList[row[7]]);
                        }
                    },
                    {
                        "className": "text-right text-small",
                        "render": function ( data, type, row ) {
                            var total = 0;
                            for(var i = 0; i < quotationList[data].quotationPrestaList.length; i++) {
                                if (quotationList[data].quotationPrestaList[i].productObj) {
                                    var subtotal = quotationList[data].quotationPrestaList[i].productObj.productTTC * quotationList[data].quotationPrestaList[i].prestaQuantity;
                                    var discount = (quotationList[data].quotationPrestaList[i].prestaDiscount > 0 ? ((100 - quotationList[data].quotationPrestaList[i].prestaDiscount ) / 100.0) : 1);

                                    subtotal *= discount;
                                    total += subtotal;
                                }
                            }
                            if (quotationList[data].quotationGlobalDiscount) total -= quotationList[data].quotationGlobalDiscount;
                            total = rounded(total);
                            return data ? numeral(total).format('0.00') + " €": "";
                        },
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

    // update/delete for Quotation
    if (quotationList && quotationList.length > 0) {
        for (var i = 0; i < quotationList.length; i++) {
            $("#delQuotation" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                // update the content of popup before showing
                popup.updateForDelete(quotationList[n].quotationRef, quotationList[n].quotationType == -1 ? "ce Devis" : "cette Facture", "/quotationDel?quotationId=", quotationList[n].quotationId);
                popup.show();
                return false;
            });
        }
    }

    $("#addQuotation").click( function() {
        window.location.href='/quotation?type=-1';
    });

    $("#addInvoice").click( function() {
        window.location.href='/quotation?type=1';
    });

    $("#filterQuotation").click( function() {
        if ($("#filterQuotation").prop("checked")) {
            $(".opacitedTR").hide();
        } else {
            $(".opacitedTR").show();
        }
    });

    $("#filterInvoice").click( function() {
        if ($("#filterInvoice").prop("checked")) {
            $(".notopacitedTR").hide();
        } else {
            $(".notopacitedTR").show();
        }
    });
};

var quotationValidator = function() {
    $('#backButMain').click(function() {
        window.location.href='/quotationMenu';
    });

    firstTime = true;

    customerInit();
    prestaInit();
    paymentInit();
    dataInit();

    // validation button
    $("#confirmQuotation").click ( validateQuotation );

    $("#convertToInvoice").tooltip();
    $("#convertToInvoice").click ( convertToInvoice );
};


// ********************************************************************************************************
// CUSTOMER
// ********************************************************************************************************
var customerInit = function() {

    if (!quotationObj.isAlreadyStarted) {
        $("#customerexisttab").dataTable( {
                    "jQueryUI":         true,
                    "language":         { "url": "./js/datatables_customer.lang" },
                    "dom":              '<<"H"r<"#CustomerHeader">f>t<"F"i>',
                    "iDisplayLength":   -1,
                    "scrollY":          "250px",
                    "fnInitComplete":   function() { $("#CustomerHeader").html("<b>Clients</b>") },
                    "order":            [[ 1, "asc" ]],
                    "columnDefs": [
                        {
                            "width": 40,
                            "type": "title-string",
                            "targets": [0]
                        },
                        {
                            "className": "text-left",
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
                    firstTime = false;
                    quotationObj.customerObj = customerList[n];
                    checkCustomerSelectedField();
                    return false;
                });
            }
        }

        // unselect
        $("#unselectCust").click( function() {
            quotationObj.customerObj = null;
            firstTime = false;
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
                if ($field.attr("id") == "quotationPersonFirstname") {
                    if ($("#quotationPersonLastname").val() != "") return true;
                } else if ($field.attr("id") == "quotationPersonLastname") {
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
    }
    checkValidityCustomer();
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
        // build customer Obj
        var customerObj = {};
        // no ID
        if ($("#quotationCustomerStatus").val() != "") customerObj.customerStatus = $("#quotationCustomerStatus").val(); else return false;
        if ($("#quotationCustomerType").val() != "") customerObj.customerType = $("#quotationCustomerType").val(); else return false;
        customerObj.customerNote = "";
        customerObj.displayName = "";
        if (customerObj.customerType == 1) { // person
            customerObj.companyObj = null;
        } else {
            customerObj.companyObj = {};
            if ($("#quotationCompanyLegal").val() != "") customerObj.companyObj.companyLegal = $("#quotationCompanyLegal").val(); else return false;
            if ($("#quotationCompanyName").val() != "") customerObj.companyObj.companyName = $("#quotationCompanyName").val(); else return false;
            customerObj.companyObj.companyTVA = "";
            customerObj.companyObj.companySiret = "";
            customerObj.companyObj.companyAPE = "";
            customerObj.companyObj.addressObj = {};
            customerObj.companyObj.addressObj.addressURL = "";
            customerObj.companyObj.addressObj.addressLine1 = $("#quotationCompanyAddressLine1").val();
            customerObj.companyObj.addressObj.addressLine2 = $("#quotationCompanyAddressLine2").val();
            customerObj.companyObj.addressObj.addressCP = $("#quotationCompanyAddressCP").val();
            customerObj.companyObj.addressObj.addressCity = $("#quotationCompanyAddressCity").val();
            customerObj.companyObj.addressObj.addressCountry = $("#quotationCompanyAddressCountry").val();
            customerObj.companyObj.contactObj = {};
            customerObj.companyObj.contactObj.contactTel = $("#quotationCompanyContactTel").val();
            customerObj.companyObj.contactObj.contactFax = "";
            customerObj.companyObj.contactObj.contactMobile = $("#quotationCompanyContactMobile").val();
            customerObj.companyObj.contactObj.contactMail = $("#quotationCompanyContactMail").val();
        }
        customerObj.personObj = {};
        if ($("#quotationPersonGender").val() != "") customerObj.personObj.personGender = $("#quotationPersonGender").val(); else return false;
        if ($("#quotationPersonFirstname").val() != "" || $("#quotationPersonLastname").val() != "") {
            customerObj.personObj.personFirstname = $("#quotationPersonFirstname").val();
            customerObj.personObj.personLastname = $("#quotationPersonLastname").val();
        } else return false;
        customerObj.personObj.personNote = "";
        customerObj.personObj.addressObj = {};
        customerObj.personObj.addressObj.addressURL = "";
        customerObj.personObj.addressObj.addressLine1 = $("#quotationPersonAddressLine1").val();
        customerObj.personObj.addressObj.addressLine2 = $("#quotationPersonAddressLine2").val();
        customerObj.personObj.addressObj.addressCP = $("#quotationPersonAddressCP").val();
        customerObj.personObj.addressObj.addressCity = $("#quotationPersonAddressCity").val();
        customerObj.personObj.addressObj.addressCountry = $("#quotationPersonAddressCountry").val();
        customerObj.personObj.contactObj = {};
        customerObj.personObj.contactObj.contactTel = $("#quotationPersonContactTel").val();
        customerObj.personObj.contactObj.contactFax = "";
        customerObj.personObj.contactObj.contactMobile = $("#quotationPersonContactMobile").val();
        customerObj.personObj.contactObj.contactMail = $("#quotationPersonContactMail").val();
        if (customerObj.customerType == -1) {
            customerObj.displayName = customerObj.companyObj.companyName;
            if (customerObj.personObj.personLastname || customerObj.personObj.personFirstname) {
                customerObj.displayName += ' ( <em class="text-small">';
                customerObj.displayName += customerObj.personObj.personGender ? customerObj.personObj.personGender + " " : "";
                customerObj.displayName += customerObj.personObj.personLastname ? customerObj.personObj.personLastname + " " : "";
                customerObj.displayName += customerObj.personObj.personFirstname ? customerObj.personObj.personFirstname : "";
                customerObj.displayName += '</em> )';
            }
        } else {
            customerObj.displayName += customerObj.personObj.personGender ? customerObj.personObj.personGender + " " : "";
            customerObj.displayName += customerObj.personObj.personLastname ? customerObj.personObj.personLastname + " " : "";
            customerObj.displayName += customerObj.personObj.personFirstname ? customerObj.personObj.personFirstname : "";
        }
        quotationObj.customerObj = customerObj;
        firstTime = false;
        checkCustomerSelectedField();
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

var prestaTabInit = function() {
    if ($("#producttab").length != 0) {
        $("#producttab").dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_product.lang" },
                "dom":              '<<"H"r<"#ProductHeader">f>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#ProductHeader").html("<b>Prestations</b>") },
                "order":            [[ 1, "asc" ], [2, "asc"]],
                "columnDefs": [
                    {
                        "className": "text-left text-small",
                        "width": 80,
                        "targets": [0]
                    },
                    {
                        "className": "text-center text-small",
                        "type": "title-string",
                        "width": 50,
                        "targets": [1]
                    },
                    {
                        "className": "text-left text-small",
                        "render": function ( data, type, row ) {
                            return getProfitIm(row[4], row[3], row[8], row[9], row[10]) + " &nbsp; " + data + (row[5] != "" ? " (/" + row[5] + ")" :"");
                        },
                        "targets": [2]
                    },
                    {
                        "width": 60,
                        "render": function ( data, type, row ) {
                            return numeral(data).format('0.00') + "&nbsp;€";
                        },
                        "className": "text-right text-small",
                        "targets": [3]
                    },
                    {
                        "width": 80,
                        "render": function ( data, type, row ) {
                            return numeral(data).format('0.00') + "&nbsp;€ " +
                                    "<a href='#' data-placement='bottom' " +
                                    "data-tooltipsmall='TTC: " + formatAmount(data) +
                                    "\nHT: " + formatAmount(getHT(data, row[8])) +
                                    "\nMarge: " + formatAmount(getProfit(getHT(data, row[8]), data, row[3])) +
                                    "\nFacteur: " + formatFactor(getProfitFactor(getHT(data, row[8]), data, row[3])) +
                                    "'> " +
                                    " <span class='glyphicon glyphicon-info-sign'></span></a> ";
                        },
                        "className": "text-right text-small",
                        "targets": [4]
                    },
                    {
                        "visible": false,
                        "searchable": false,
                        "targets": [5, 8, 9, 10]
                    },
                    {
                        "width": 80,
                        "className": "text-center text-small",
                        "targets": [6, 8]
                    },
                    {
                        "width": 36,
                        "targets": [7] ,
                        "sortable": false,
                        "searchable": false
                    }
                ]
        } );
    }

    // the "SELECT PRODUCT" button
    if (productList.length > 0) {
        for (var i = 0; i < productList.length; i++) {
            // select
            $("#selectPresta" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                firstTime = false;
                addPresta(productList[n]);
                return false;
            });
        }
    }
};

var prestaInit = function() {
    if (quotationObj && !quotationObj.isAlreadyStarted) {
        prestaTabInit();

        // buttons of system action
        $("#addEmpty").click(addEmpty);
        $("#addComm").click(addComm);
        $("#addST").click(addST);

        // add new presta button
        $("#addNewPresta").click( addNewPopupPresta );

        // popup NEW content
        if ($("#popupContentNewPresta").html() != "") {
            popup.updateJS2("Nouvelle Prestation", $("#popupContentNewPresta").html(), "Annuler", "Ajouter", validNewPrestaHandler, true);
            $("#popupContentNewPresta").html("");
        }

        // validator for new presta
        $("#popupForm2").bootstrapValidator( { excluded: [] } );
        // select box "groupProduct"
        // need to create new function (from the ones existing in product.js)
        // because we don't need to update "factorOk" and "factorNok"
        // which will update the datatable
        for (var i = 0; i < $("#maxGroupList").val(); i++) {
            $("#optionGroup" + i).click(productGroupSelectQuo);
        }
        $("#productTTC").keyup(productPriceUpdateFromTTCQuo);
        $("#productHT").keyup(productPriceUpdateFromHTQuo);
    }

    for (var i = 0; i < quotationObj.quotationPaymentList.length; i++) {
        quotationObj.quotationPaymentList[i].paymentDatePaid = new Date(quotationObj.quotationPaymentList[i].paymentDatePaid);
    }

    // initial refresh
    refreshPrestaGrid();
};

var checkPresta = function() {
    $("#checkPrestaOk").removeClass("hide");
    $("#checkPrestaOk").show();
    $("#checkPrestaNok").hide();
};

var uncheckPresta = function() {
    $("#checkPrestaNok").removeClass("hide");
    $("#checkPrestaNok").show();
    $("#checkPrestaOk").hide();
};

var refreshNumber = function() {
    firstTime = false;
    if (quotationObj.quotationPrestaList.length == 0) {
        $("#TOTAL").html(formatAmount(0));
        uncheckPresta();
    } else {
        var total = 0;
        var tva = [];
        var nextSubtotal = 0;
        for(var i = 0; i < quotationObj.quotationPrestaList.length; i++) {
            var p = quotationObj.quotationPrestaList[i];
            if (p.prestaST) {
                $("#SUBTOTAL" + i).html( "<b>" + formatAmount(nextSubtotal) + "</b>");
                nextSubtotal = 0;
            } else if (p.productObj != null) {
                p.prestaQuantity = $("#productQty" + i).val();
                p.prestaDiscount = $("#productDiscount" + i).val();
                var subtotal = p.productObj.productTTC * p.prestaQuantity;
                $("#productSubTotal" + i).html( formatAmount(subtotal) );
                var discount = (p.prestaDiscount > 0 ? ((100 - p.prestaDiscount ) / 100.0) : 1);
                subtotal *= discount;
                $("#productTotal" + i).html( formatAmount(subtotal) );
                if (!tva[p.productObj.TVAId]) {
                    tva[p.productObj.TVAId] = 0;
                }
                tva[p.productObj.TVAId] += (p.productObj.productTTC - getHT(p.productObj.productTTC, p.productObj.TVAPercent) ) * p.prestaQuantity * discount;
                total += subtotal;
                nextSubtotal += subtotal;
            }
        }
        $("#TOTAL").html( "<b>" + formatAmount(total) + "</b>" );
        updatePaymentTab(total);
        // inclusive tvas
        for(TVAId in tva) {
            $("#TOTALTVA" + TVAId).html( "<b>" + formatAmount(tva[TVAId]) + "</b>" );
        }
        if (total > 0) checkPresta();
        else uncheckPresta();
    }

    // status in Data tab
    refreshStatus();

    return true;
};



var delSelectedPresta = function() {
    var n = $( this ).attr('href').substring(1);
    quotationObj.quotationPrestaList.splice(n, 1);
    firstTime = false;
    refreshPrestaGrid();
    return false;
};

var swap = function(x , y) {
    var b = quotationObj.quotationPrestaList[y];
    firstTime = false;
    quotationObj.quotationPrestaList[y] = quotationObj.quotationPrestaList[x];
    quotationObj.quotationPrestaList[x] = b;
};

var moveUpPresta = function() {
    var n = $( this ).attr('href').substring(1);
    if (n > 0) {
        firstTime = false;
        swap(parseInt(n), parseInt(n) - 1);
        refreshPrestaGrid();
    }
    return false;
};

var moveDownPresta = function() {
    var n = $( this ).attr('href').substring(1);
    if (n < quotationObj.quotationPrestaList.length - 1) {
        firstTime = false;
        swap(parseInt(n), parseInt(n) + 1);
        refreshPrestaGrid();
    }
    return false;
};

var refreshPrestaGrid = function() {
    if (quotationObj.quotationPrestaList.length == 0) {
        $("#prestatab> tbody").html("<tr class='evenCondensed'><td colspan='10' class='text-center'><em>Aucune Prestation enregistrée</em></td></tr><tr class='oddCondensed'><td class='text-center'><input type='radio' name='selectedPresta' value='0' checked/></td><td colspan='7' class='text-right'><b>TOTAL :</b> </td><td class='text-right' id='TOTAL'><b>" + formatAmount(0) + "</b></td><td>&nbsp;</td></tr>")
        uncheckPresta();
    } else {
        var selected = null;
        if ($('input[name=selectedPresta]:checked', '#prestatab').length > 0) {
            selected = parseInt($('input[name=selectedPresta]:checked', '#prestatab').val()) + 1;
        }
        var content = "";
        var total = 0;
        var tva = [];
        var tvaLab = [];
        var nextSubtotal = 0;
        for(var i = 0; i < quotationObj.quotationPrestaList.length; i++) {
            content += "<tr class='" + ( i % 2 == 0 ? "evenCondensed" : "oddCondensed") + "'>";
            var sel = "<td class='text-center'><table border='0'>";
            sel += "<tr class='" + ( i % 2 == 0 ? "evenCondensed" : "oddCondensed") + "'><td style='border-left: none'><input type='radio' name='selectedPresta' value='" + i + "'/></td><td style='width: 14px'>" + (i > 0 ? "<a href='#" + i + "' id='up" + i + "'><img src='im/arrow-up-brown-12x12.png' border='0'></a>" : "&nbsp;") + "</td>";
            sel += "<td style='width: 14px'>" + (i < quotationObj.quotationPrestaList.length - 1  ? "<a href='#" + i + "' id='down" + i + "'><img src='im/arrow-down-brown-12x12.png' border='0'></a>" : "&nbsp;") + "</td></tr>";
            sel += "</table></td>";
            var rem = "<td class='text-center'><a href='#" + i + "' id='removePresta" + i + "'><span class='red glyphicon glyphicon-remove-sign'></span></a></td>";

            if (quotationObj && quotationObj.isAlreadyStarted) {
                sel = "<td class='text-center'>&nbsp;</td>";
                rem = sel;
            }

            if (quotationObj.quotationPrestaList[i].prestaST) {
                content += sel + "<td colspan='7' class='text-right'><b>SOUS-TOTAL :</b> </td><td class='text-right' id='SUBTOTAL" + i + "'><b>" + formatAmount(nextSubtotal) + "</b></td>" + rem;
                nextSubtotal = 0; // reset the calculation of sub total
            } else if (quotationObj.quotationPrestaList[i].productObj == null) {
                content += sel + "<td colspan='8' class='text-center'>" + quotationObj.quotationPrestaList[i].prestaFreeField.replace(/(<([^>]+)>)/ig,"") + "</td>" + rem;
            } else {
                var p = quotationObj.quotationPrestaList[i].productObj;
                content += sel;
                content += "<td class='text-center'>" + p.productCode + "</td>";
                content += "<td class='text-left'>" + p.productLabel + (p.productUnit != "" ? " (/" + p.productUnit + ")" : "") + "</td>";
                content += "<td class='text-right'>" + formatAmount(getHT(p.productTTC, p.TVAPercent)) + "</td>";
                if (quotationObj && quotationObj.isAlreadyStarted) {
                    content += "<td class='text-center'>" + quotationObj.quotationPrestaList[i].prestaQuantity + "</td>";
                } else {
                    content += "<td class='text-center'><input size='3' class='text-center' type='text' id='productQty" + i + "' value='" + quotationObj.quotationPrestaList[i].prestaQuantity + "' /></td>";
                }
                content += "<td class='text-center'>" + p.TVALabel + "</td>";
                var subtotal = p.productTTC * quotationObj.quotationPrestaList[i].prestaQuantity;
                content += "<td class='text-right' id='productSubTotal" + i + "'>" + formatAmount(subtotal) + "</td>";
                var discount = (quotationObj.quotationPrestaList[i].prestaDiscount > 0 ? ((100 - quotationObj.quotationPrestaList[i].prestaDiscount ) / 100.0) : 1);
                subtotal *= discount;
                if (!tva[p.TVAId]) {
                    tva[p.TVAId] = 0;
                    tvaLab[p.TVAId] = p.TVALabel;
                }
                tva[p.TVAId] += (p.productTTC - getHT(p.productTTC, p.TVAPercent) ) * quotationObj.quotationPrestaList[i].prestaQuantity * discount;
                if (quotationObj && quotationObj.isAlreadyStarted) {
                    content += "<td class='text-center'>" + quotationObj.quotationPrestaList[i].prestaDiscount + "</td>";
                } else {
                    content += "<td class='text-center'><input size='3' class='text-center' type='text' placeholder='0' id='productDiscount" + i + "' value='" + quotationObj.quotationPrestaList[i].prestaDiscount + "' /></td>";
                }
                content += "<td class='text-right' id='productTotal" + i + "'>" + formatAmount(subtotal) + "</td>";
                content += rem;
                total += subtotal;
                nextSubtotal += subtotal;
            }
            content += "</tr>\n";
        }
        // total
        content += "<tr class='" + ( i % 2 == 0 ? "evenCondensed" : "oddCondensed") + "'>";
        content += "<td class='text-center'><input type='radio' name='selectedPresta' value='" + i + "'/></td><td colspan='7' class='text-right'><b>TOTAL :</b> </td><td class='text-right' id='TOTAL'><b>" + formatAmount(total) + "</b></td><td>&nbsp;</td>";
        content += "</tr>";
        // inclusive tvas
        for(TVAId in tvaLab) {
            content += "<tr class='" + ( i % 2 == 0 ? "evenCondensed" : "oddCondensed") + "'>";
            content += "<td class='text-center'>&nbsp;</td><td colspan='7' class='text-right'><b>dont " + tvaLab[TVAId] + " :</b> </td><td class='text-right' id='TOTALTVA" + TVAId + "'><b>" + formatAmount(tva[TVAId]) + "</b></td><td>&nbsp;</td>";
            content += "</tr>";
        }
        quotationObj.tvaLab = tvaLab;
        quotationObj.tvaList = tva;

        updatePaymentTab(total);

        $("#prestatab> tbody").html(content);
        for(var i = 0; i < quotationObj.quotationPrestaList.length; i++) {
            // add event on products inputs
            if (quotationObj.quotationPrestaList[i].productObj != null) {
                $("#productQty" + i).keyup( refreshNumber );
                $("#productDiscount" + i).keyup( refreshNumber );
            }
            $("#removePresta" + i).click( delSelectedPresta );
            $("#up" + i).click( moveUpPresta );
            $("#down" + i).click( moveDownPresta );
        }

        if (!selected) {
            $('input[name=selectedPresta]:last', '#prestatab').prop('checked', true);
        } else {
            $('input[name=selectedPresta][value=' + selected + ']', '#prestatab').prop('checked', true);
        }

        if (total > 0) checkPresta();
        else uncheckPresta();

        // status in Data tab
        refreshStatus();
    }
};

var addEmpty = function() {
    if (!quotationObj.quotationPrestaList) quotationObj.quotationPrestaList = [];
    prestaObj = {
        productObj: null,
        prestaId: null,
        prestaQuantity: null,
        prestaDiscount: null,
        prestaFreeField: "&nbsp;",
        prestaST: false };

    var i = getPositionToInsert();
    insertIntoPresta(prestaObj, i);
    refreshPrestaGrid();
    return false;
};

var addComm = function() {
    if (JStrim($("#comm").val()) == "") {
        $("#pop").html("Pas de Commentaire à ajouter !");
        $("#pop").dialog( {
            dialogClass: "popsuperup",
            title: "Ajouter un Commentaire",
            buttons: [ {
                text: "OK",
                click: function() {
                    $( this ).dialog( "close" );
                }
            } ],
            modal: true }
        );
    } else {
        if (!quotationObj.quotationPrestaList) quotationObj.quotationPrestaList = [];
        prestaObj = {
            productObj: null,
            prestaId: null,
            prestaQuantity: null,
            prestaDiscount: null,
            prestaFreeField: JStrim($("#comm").val()),
            prestaST: false };

        var i = getPositionToInsert();
        insertIntoPresta(prestaObj, i);
        refreshPrestaGrid();
    }
    return false;
};

var addST = function() {
    if (!quotationObj.quotationPrestaList) quotationObj.quotationPrestaList = [];
    prestaObj = {
        productObj: null,
        prestaId: null,
        prestaQuantity: null,
        prestaDiscount: null,
        prestaFreeField: null,
        prestaST: true };

    var i = getPositionToInsert();
    insertIntoPresta(prestaObj, i);
    refreshPrestaGrid();
    prestaObj = {
        productObj: null,
        prestaId: null,
        prestaQuantity: null,
        prestaDiscount: null,
        prestaFreeField: "&nbsp;",
        prestaST: false };
    i++;
    insertIntoPresta(prestaObj, i);

    refreshPrestaGrid();
    return false;
};

var addPresta = function(product) {
    if (product != null) {
        if (!quotationObj.quotationPrestaList) quotationObj.quotationPrestaList = [];
        prestaObj = {
            productObj: product,
            prestaId: null,
            prestaQuantity: 1,
            prestaDiscount: 0,
            prestaFreeField: null,
            prestaST: false };

        var i = getPositionToInsert();
        insertIntoPresta(prestaObj, i);
        refreshPrestaGrid();
    }
};

var getPositionToInsert = function() {
    if ($('input[name=selectedPresta]:checked', '#prestatab').length == 0)  return 0;
    else return $('input[name=selectedPresta]:checked', '#prestatab').val();
};

var insertIntoPresta = function(prestaObj, i) {
    firstTime = false;
    if (i == quotationObj.quotationPrestaList.length ) { // last selected
        quotationObj.quotationPrestaList.push(prestaObj);
    } else {
        quotationObj.quotationPrestaList.splice(i, 0, prestaObj);
    }
};

var productGroupSelectQuo = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring(11);
    // update hidden field
    $("#groupProductId").val($("#optionGroupId" + i).val());
    $("#groupProductTVAPercent").val($("#TVAPercent" + i).val());
    // update text to let know to the user what field is selected
    $("#selectGroup").html($(this).html());
    productPriceUpdateFromGroupProductQuo();
    $("#popupForm2").bootstrapValidator("revalidateField", "groupProductTVAPercent");
    $("#selectDrop").click();
    return false;
};

var lastModeQuo = null;

var productPriceUpdateFromGroupProductQuo = function() {
    productPriceUpdateQuo(lastModeQuo);
};

var productPriceUpdateFromTTCQuo = function() {
    productPriceUpdateQuo(1);
};

var productPriceUpdateFromHTQuo = function() {
    productPriceUpdateQuo(2);
};

var productPriceUpdateQuo = function(mode) {
    lastModeQuo = mode;
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
};

var validNewPrestaHandler = function() {
    $("#popupForm2").bootstrapValidator("validate");
    var fields = $("#popupForm2").data("bootstrapValidator").getInvalidFields();
    if (fields.length > 0) {
        if (fields[0].type == "hidden") $("#selectGroup").get(0).scrollIntoView();
        else fields[0].scrollIntoView();
        popup.show2();
    } else {
        // mask
        $(".tab-content").append("<div class='modal modalmask'></div>");
        // submit the form
        $.ajax(
            "/productQuotation",
            {
                success: function(data, status) {
                    if (data == "0") { // something has not working
                        $(".modalmask").remove();
                        $("#pop").html("Erreur lors de la transmission de données");
                        $("#pop").dialog( {
                            dialogClass: "popsuperup",
                            title: "Erreurs",
                            buttons: [ {
                                text: "OK",
                                click: function() {
                                    $( this ).dialog( "close" );
                                }
                            } ],
                            modal: true }
                        );
                    } else {
                        $(".modalmask").remove();
                        $("#pop").html("Nouvelle Prestation Enregistrée");
                        $("#pop").dialog( {
                            dialogClass: "popsuperup",
                            title: "OK",
                            buttons: [ {
                                text: "OK",
                                click: function() {
                                    $(".tab-content").append("<div class='modal modalmask'></div>");
                                    // create new ProductObj in order to refresh the list
                                    var productObj = {};
                                    productObj.productId = parseInt(data);
                                    for (var i = 0 ; i < groupProductList.length; i++) {
                                        if (groupProductList[i].groupProductId == $("#groupProductId").val()) {
                                            productObj.groupProductId = groupProductList[i].groupProductId;
                                            productObj.groupProductIcon = groupProductList[i].groupProductIcon;
                                            productObj.groupProductIconW = groupProductList[i].groupProductIconW;
                                            productObj.groupProductIconH = groupProductList[i].groupProductIconH;
                                            productObj.groupProductLabel = groupProductList[i].groupProductLabel;
                                            productObj.TVALabel = groupProductList[i].TVALabel;
                                            productObj.TVAId = groupProductList[i].TVAId;
                                            productObj.TVAPercent = groupProductList[i].TVAPercent;
                                        }
                                    }
                                    productObj.productCode = JStrim($("#productCode").val());
                                    productObj.productLabel = JStrim($("#productLabel").val());
                                    productObj.productPaid = parseFloat($("#productPaid").val().replace(",","."));
                                    productObj.productTTC = parseFloat($("#productTTC").val().replace(",","."));
                                    productObj.productUnit = JStrim($("#productUnit").val());
                                    addToProductList(productObj);
                                    $(".modalmask").remove();
                                    $( this ).dialog( "close" );
                                }
                            } ],
                            modal: true }
                        );
                    }
                },
                data: $("#popupForm2").serialize(),
                error: function(data, status, err) {
                    $(".modalmask").remove();
                    $("#pop").html("Erreur lors de la transmission de données : " + err);
                    $("#pop").dialog( {
                        dialogClass: "popsuperup",
                        title: "Erreurs",
                        buttons: [ {
                            text: "OK",
                            click: function() {
                                $( this ).dialog( "close" );
                            }
                        } ],
                        modal: true }
                    );
                },
                type: "POST"
            }
        );
        popup.hide2();
    }
    return false;
};

var getProductHead = function() {
    var r = "";
    r += "<tr>\n";
    r += "<th>Code</th>\n";
    r += "<th>Catégorie</th>\n";
    r += "<th>Prestation</th>\n";
    r += "<th>Coût</th>\n";
    r += "<th>Prix TTC</th>\n";
    r += "<th>Unité</th>\n";
    r += "<th>TVA</th>\n";
    r += "<th>&nbsp;</th>\n";
    r += "<th>TVA</th>\n";
    r += "<th>fOk</th>\n";
    r += "<th>fNull</th>\n";
    r += "</tr>\n";
    return r;
}

var addToProductList = function(productObj) {
    productList.push(productObj);
    // refresh the presta list
    var content =   "";
    content +=      "<input type='hidden' id='maxCustomer' value='" + productList.length + "' />\n";
    content +=      "<table id='producttab' class='stripe hover cell-border row-border nowrap compact' cellspacing='0' width='100%'>\n";
    content +=      "<thead>\n";
    content +=      getProductHead();
    content +=      "</thead>\n";
    content +=      "<tbody>\n";

    for (var i = 0; i < productList.length; i++) {
        content +=   "<tr>\n";
        content +=      "<td>" + productList[i].productCode.replace(/(<([^>]+)>)/ig,"") + "</td>\n";
        content +=      "<td>\n";
        if (productList[i].groupProductIcon) {
            content +=  "<a href='#' data-placement='bottom'  title='" + productList[i].groupProductLabel.replace(/(<([^>]+)>)/ig,"") + "' data-tooltipsmall=\"" + productList[i].groupProductLabel.replace(/(<([^>]+)>)/ig,"").replace("\"","\\\"") + "\">\n";
            content +=  "<img src='" + productList[i].groupProductIcon + "' width='" + (3 * productList[i].groupProductIconW / 4) + "' height='" + (3 * productList[i].groupProductIconH / 4) + "' />\n";
        } else {
            content +=  productList[i].groupProductLabel.replace(/(<([^>]+)>)/ig,"") + "\n";
        }
        content +=      "</td>\n";
        content +=      "<td id='labelProduct" + i + "'>" + productList[i].productLabel.replace(/(<([^>]+)>)/ig,"") + "</td>\n";
        content +=      "<td>" + productList[i].productPaid + "</td>\n";
        content +=      "<td>" + productList[i].productTTC + "</td>\n";
        content +=      "<td>" + productList[i].productUnit.replace(/(<([^>]+)>)/ig,"") + "</td>\n";
        content +=      "<td>" + productList[i].TVALabel.replace(/(<([^>]+)>)/ig,"") + "</td>\n";
        content +=      "<td><a href='#" + i + "' id='selectPresta" +  i + "' data-placement='bottom' data-tooltipsmall='Ajouter cette prestation'><span class='glyphicon glyphicon-new-window'></span></a></td>\n";
        content +=      "<td>" + productList[i].TVAPercent + "</td>\n";
        content +=      "<td>" + ownerFactorOk + "</td>\n";
        content +=      "<td>" + ownerFactorNull + "</td>\n";
        content +=      "</td>\n";
        content +=      "</tr>\n";
    }
    content +=      "</tbody>\n";
    content +=      "</table>\n";

    $("#producttabdiv").html(content);
    prestaTabInit();
};

// new to create a popup with the form in order to define the new customer Obj and to select it
var addNewPopupPresta = function () {
    popup.show2();
    return false;
};

// ********************************************************************************************************
// PAYMENT
// ********************************************************************************************************

var checkPayment = function() {
    $("#checkPaymentOk").removeClass("hide");
    $("#checkPaymentOk").show();
    $("#checkPaymentNok").hide();
};

var uncheckPayment = function() {
    $("#checkPaymentNok").removeClass("hide");
    $("#checkPaymentNok").show();
    $("#checkPaymentOk").hide();
};

var updatePaymentTab = function() {
    // copy Total from Presta in payment tab
    $("#quotationTotalTTC").html( formatAmountNoUnit(0) );
    // update discount if exist
    if ($("#quotationGlobalDiscountPercent").val() != "") updateTotalToPaidPercent();
    else updateTotalToPaid();
    refreshAll();
};

var updatePaymentTab = function(total) {
    // copy Total from Presta in payment tab
    $("#quotationTotalTTC").html( formatAmountNoUnit(total) );
    // update discount if exist
    if ($("#quotationGlobalDiscountPercent").val() != "") updateTotalToPaidPercent();
    else updateTotalToPaid();
    refreshAll();
};

var updatedTotalToPaid = function() {
    firstTime = false;
    updateTotalToPaid();
};
var updatedTotalToPaidPercent = function() {
    firstTime = false;
    updateTotalToPaidPercent();
};

var paymentInit = function() {
    $("#quotationGlobalDiscount").keyup( updatedTotalToPaid );
    $("#quotationGlobalDiscountPercent").keyup( updatedTotalToPaidPercent );
    // select box "Payment Conditions"
    for (var i = 0; i < payCondList.length; i++) {
        $("#optionquotationPayCond" + i).click( quotationPayCondSelect );
    }
    // select boxes "Payment Type"
    for (var i = 0; i < payTypeList.length; i++) {
        $("#optionquotationPayType" + i).click( quotationPayTypeSelect );
        $("#optionpaymentPayType" + i).click( paymentPayTypeSelect );
    }
    // button "add" payment type
    $("#addPayType").click( addPayType );

    // real deposite
    $("#quotationRealDeposite"). keyup( updatedDeposite );

    // the date picker for payment
    $("#paymentDate").datepicker( {
            todayHighlight: true,
            language: "fr"
        }).on("changeDate", function(ev) { $(".datepicker").hide(); });

    // amount key
    $("#paymentAmount").keyup( updateAmount );

    // button add payment
    $("#addPayment").click( addPayment );

    refreshAll();
};

var updatedDeposite = function() {
    firstTime = false;
    refreshAll();
};

var refreshAll = function() {
    var totalToPaid = 0;
    var discount = parseFloat($("#quotationGlobalDiscount").val().replace(",","."));
    if (isNaN(discount)) discount = 0;
    var discountPercent = parseFloat($("#quotationGlobalDiscountPercent").val().replace(",","."));
    if (isNaN(discountPercent)) discountPercent = 0;

    // 1 To paid from discount and total
    if ($("#quotationTotalTTC").html() != "") {
        totalToPaid = parseFloat($("#quotationTotalTTC").html().replace(",","."));
        if ($("#quotationGlobalDiscount").val() != "") totalToPaid -= discount;
        if (totalToPaid < 0) totalToPaid = 0;
        $("#quotationTotalToPaid").html( formatAmountNoUnit( totalToPaid ) );
    }

    // 1a - TVA list
    if (quotationObj.tvaLab) {
        content = "";
        contentToPaid = "";
        for(TVAId in quotationObj.tvaLab) {
            content += "<b class='text-small help'>dont " + quotationObj.tvaLab[TVAId] + " : " + formatAmount(quotationObj.tvaList[TVAId]) + "</b><br/>";
            contentToPaid += "<b class='text-small help'>dont " + quotationObj.tvaLab[TVAId] + " : " + formatAmount(quotationObj.tvaList[TVAId] * (100 - discountPercent) / 100) + "</b><br/>";
        }
        $("#TVATTC").html(content);
        $("#TVATOPAID").html(contentToPaid);
    } else {
        $("#TVATTC").html("");
        $("#TVATOPAID").html("");
    }

    // 2 payment conditions
    if (quotationObj.payCondObj)    $("#selectquotationPayCond").html( quotationObj.payCondObj.payCondLabel );
    else                            $("#selectquotationPayCond").html( "Sélectionnez une Condition de Paiement" );

    // 3 deposite forseen
    if (quotationObj.payCondObj && quotationObj.payCondObj.payCondTVA > 0) {
        var deposite = quotationObj.payCondObj.payCondTVA / 100 * totalToPaid;
        $("#quotationDepositeForseen").html( formatAmountNoUnit( deposite ) );
        quotationObj.quotationDepositeForseen = deposite;
    } else $("#quotationDepositeForseen").html( formatAmountNoUnit(0) );

    // 4 paytype list
    refreshPayType(); // contains refreshCheckPayment();

    // 5 real deposite
    if ($("#quotationRealDeposite").length !== 0 && $("#quotationRealDeposite").val() != "") {
        $("#quotationRealDeposite").val($("#quotationRealDeposite").val().replace(".",",").replace(/[^0-9,]+/i,"").replace(/(,[^,]*),/gi,"$1"));
    }
    var realDeposite = parseFloat( $("#quotationRealDeposite").length !== 0 && $("#quotationRealDeposite").val() !== "" ? $("#quotationRealDeposite").val().replace(",",".") : 0 );

    quotationObj.quotationRealDeposite = realDeposite;

    totalToPaid = totalToPaid - realDeposite;
    if ($("#quotationRemainingDepositeTotal").length !== 0) {
        $("#quotationRemainingDepositeTotal").html( getColor( totalToPaid ) + formatAmountNoUnit( totalToPaid ) + getEndColor( totalToPaid) );
    }

    refreshPaymentTab(totalToPaid);

    // status in Data tab
    refreshStatus();
};

var refreshCheckPayment = function() {
    if (/*quotationObj.quotationPayTypeList.length > 0 &&*/ quotationObj.payCondObj) checkPayment();
    else uncheckPayment();
};

var updateTotalToPaid = function() {
    // update percent
    if ($("#quotationTotalTTC").html() != "") {
        var discount = parseFloat($("#quotationGlobalDiscount").val().replace(",","."));
        if (isNaN(discount)) discount = 0;
        quotationObj.quotationGlobalDiscount = discount;
        var totalttc = parseFloat($("#quotationTotalTTC").html().replace(",","."));
        $("#quotationGlobalDiscount").val($("#quotationGlobalDiscount").val().replace(".",",").replace(/[^0-9,]+/i,"").replace(/(,[^,]*),/gi,"$1"));
        if (totalttc > 0) $("#quotationGlobalDiscountPercent").val( formatProfit(discount * 100 / totalttc) );
        quotationObj.quotationGlobalDiscountPercent = Math.round(discount * 100 / totalttc * 100) / 100;
        refreshAll();
    }
};

var updateTotalToPaidPercent = function() {
    // update euros
    if ($("#quotationTotalTTC").html() != "") {
        var discountpercent = parseFloat($("#quotationGlobalDiscountPercent").val().replace(",","."));
        if (isNaN(discountpercent)) discountpercent = 0;
        var totalttc = parseFloat($("#quotationTotalTTC").html().replace(",","."));
        $("#quotationGlobalDiscountPercent").val($("#quotationGlobalDiscountPercent").val().replace(".",",").replace(/[^0-9,]+/i,"").replace(/(,[^,]*),/gi,"$1"));
        $("#quotationGlobalDiscount").val( formatProfit(discountpercent / 100 * totalttc) );
        quotationObj.quotationGlobalDiscount = Math.round(discountpercent / 100 * totalttc * 100) / 100;
        quotationObj.quotationGlobalDiscountPercent = discountpercent;
        refreshAll();
    }
};

var updateAmount = function() {
    firstTime = false;
    if ($("#paymentAmount").val() != "") {
        $("#paymentAmount").val($("#paymentAmount").val().replace(".",",").replace(/[^0-9,]+/i,"").replace(/(,[^,]*),/gi,"$1"));
    }
}

var quotationPayCondSelect = function() {
    // retrieve "i"
    var n = $( this ).attr("href").substring( 1 );
    firstTime = false;
    $("#selectDropquotationPayCond").click();
    for(var i = 0; i < payCondList.length; i++) {
        if (payCondList[i].payCondId == n) {
            quotationObj.payCondObj = payCondList[i];
        }
    }
    refreshAll();
    return false;
};

var quotationPayTypeSelect = function() {
    // retrieve "i"
    var n = $( this ).attr("href").substring( 1 );

    $("#selectDropquotationPayType").click();
    for(var i = 0; i < payTypeList.length; i++) {
        if (payTypeList[i].payTypeId == n) {
            $("#selectquotationPayType").html( payTypeList[i].payTypeLabel );
            quotationObj.currentPayTypeSelected = i;
        }
    }
    return false;
};

var paymentPayTypeSelect = function() {
    // retrieve "i"
    var n = $( this ).attr("href").substring( 1 );

    $("#selectDroppaymentPayType").click();
    for(var i = 0; i < payTypeList.length; i++) {
        if (payTypeList[i].payTypeId == n) {
            $("#selectpaymentPayType").html( payTypeList[i].payTypeLabel );
            $("#paymentPayTypeSelect").val( i );
        }
    }
    return false;
};

var addPayType = function() {
    firstTime = false;
    if (quotationObj.currentPayTypeSelected != null) {
        for (var i = 0; i < quotationObj.quotationPayTypeList.length; i++) {
            if ( quotationObj.quotationPayTypeList[i].payTypeId == payTypeList[ quotationObj.currentPayTypeSelected ].payTypeId) return;
        }
        quotationObj.quotationPayTypeList.push( payTypeList[ quotationObj.currentPayTypeSelected ] );
        refreshPayType();
    }
};

var removePayType = function() {
    // retrieve "i"
    firstTime = false;
    var n = $( this ).attr("href").substring( 1 );
    if (quotationObj.quotationPayTypeList) {
        quotationObj.quotationPayTypeList.splice(n, 1);
        refreshPayType();
    }
};

var refreshPayType = function() {
    var content = "";
    if (quotationObj.quotationPayTypeList) {
        for (var i = 0; i < quotationObj.quotationPayTypeList.length; i++) {
            content += "<b class='tag'>" + quotationObj.quotationPayTypeList[i].payTypeLabel + " ";
            if (quotationObj && !quotationObj.isAlreadyStarted) content += "&nbsp; <a href='# " + i + "' id='delPayType" + i + "'><span class='red glyphicon glyphicon-remove-sign'></span></a>";
            content += "</b>";
        }
    }
    $("#quotationPayTypeList").html(content);
    // activate del button
    if (quotationObj.quotationPayTypeList && !quotationObj.isAlreadyStarted) {
        for (var i = 0; i < quotationObj.quotationPayTypeList.length; i++) {
            $("#delPayType" + i).click(removePayType);
        }
    }
    refreshCheckPayment();
};

var getColor = function(remaining) {
    return (remaining < 0 ? "<b class='red'>" : (remaining == 0 ? "<b class='green'>" : "") );
};

var getEndColor = function(remaining) {
    return (remaining <= 0 ? "</b>" : "");
};

var refreshPaymentTab = function( remaining ) {
    if ($("#paymenttab> tbody").length !== 0) {
        if (quotationObj.quotationPaymentList.length == 0) {
            $("#paymenttab> tbody").html("<tr class='evenCondensed'><td colspan='5' class='text-center'><i>Aucun Paiement en cours</i></td></tr><tr class='oddCondensed'><td colspan='3' class='text-right'><b>TOTAL restant dû après tous les paiements :</b> </td><td class='text-right' id='REMAININGTOTAL'>" + getColor(remaining) + formatAmount(remaining) + getEndColor(remaining) + "</td><td>&nbsp;</td></tr>");
            refreshCheckPayment();
        } else {
            var content = "";
            for(var i = 0; i < quotationObj.quotationPaymentList.length; i++) {
                content += "<tr class='" + ( i % 2 == 0 ? "evenCondensed" : "oddCondensed") + "'>";
                var rem = "<td class='text-center'><a href='#" + i + "' id='removePayment" + i + "'><span class='red glyphicon glyphicon-remove-sign'></span></a></td>";

                var p = quotationObj.quotationPaymentList[i];
                content += "<td class='text-center'>" + (p.paymentDatePaid ? p.paymentDatePaid.format("DD-MM-YYYY") : "") + "</td>";
                content += "<td class='text-right'>" + formatAmount( p.paymentAmount ) + "</td>";
                content += "<td class='text-center'>" + p.payTypeObj.payTypeLabel + "</td>";

                content += "<td class='text-right' id='paymentRemainingTotal" + i + "'>" + getColor(remaining) + formatAmount( remaining) + getEndColor(remaining) + "</td>";
                remaining = remaining - p.paymentAmount;
                content += rem;
                content += "</tr>\n";
            }
            // total
            content += "<tr class='" + ( i % 2 == 0 ? "evenCondensed" : "oddCondensed") + "'>";
            content += "<td colspan='3' class='text-right'><b>TOTAL restant dû après tous les paiements :</b> </td><td class='text-right' id='REMAININGTOTAL'>" + getColor(remaining) + formatAmount(remaining) + getEndColor(remaining) + "</td><td>&nbsp;</td>";
            content += "</tr>";

            $("#paymenttab> tbody").html(content);
            for(var i = 0; i < quotationObj.quotationPaymentList.length; i++) {
                // add event on payment button
                $("#removePayment" + i).click( removePayment );
            }

            refreshCheckPayment();
        }
    }
};

var removePayment = function() {
    firstTime = false;
    var n = $( this ).attr('href').substring(1);
    quotationObj.quotationPaymentList.splice(n, 1);
    refreshAll();
    return false;
};

var addPayment = function() {
    var error = "";
    // 1 is a date spotted ?
    if (JStrim($("#paymentDateInput").val()) == "") error += "Pas de date précisée !<br/>";

    // 2 is a pay type selected ?
    if ($("#paymentPayTypeSelect").val() == "") error += "Pas de type de paiement choisi !<br/>";

    // 3 amount ?
    if (JStrim($("#paymentAmount").val()) == "") error += "Pas de montant !<br/>";

    if (error != "") {
        $("#pop").html(error);
        $("#pop").dialog( {
            dialogClass: "popsuperup",
            title: "Erreurs",
            buttons: [ {
                text: "OK",
                click: function() {
                    $( this ).dialog( "close" );
                }
            } ],
            modal: true }
        );
    } else {
        firstTime = false;
        // all "seems" to be ok
        var d = $("#paymentDate").datepicker("getDate");
        var pT = payTypeList[ parseInt( $("#paymentPayTypeSelect").val() ) ];
        var amo = parseFloat( JStrim($("#paymentAmount").val().replace(",",".")) );
        var paymentObj = { paymentId: null, paymentDatePaid: d, payTypeObj: pT, paymentAmount: amo, paymentStatusPaid: '' };
        quotationObj.quotationPaymentList.push(paymentObj);
        refreshAll();
    }
};

// ********************************************************************************************************
// DATA
// ********************************************************************************************************

var checkData = function() {
    $("#checkDataOk").removeClass("hide");
    $("#checkDataOk").show();
    $("#checkDataNok").hide();
};

var uncheckData = function() {
    $("#checkDataNok").removeClass("hide");
    $("#checkDataNok").show();
    $("#checkDataOk").hide();
};

var dataInit = function() {
    // the date picker for creationdt
    $("#quotationCreationDt").datepicker( {
        todayHighlight: true,
        language: "fr"
    }).on("changeDate", function(ev) {
        firstTime = false;
        quotationObj.quotationCreationDt = $("#quotationCreationDt").datepicker("getDate");
        $(".datepicker").hide();
        refreshStatus();
    });

    // the date picker for end validity dt (quotation only)
    $("#quotationEndValidityDt").datepicker( {
        todayHighlight: true,
        language: "fr"
    }).on("changeDate", function(ev) {
        firstTime = false;
        quotationObj.quotationEndValidityDt = $("#quotationEndValidityDt").datepicker("getDate");
        $(".datepicker").hide();
        refreshStatus();
    });

    if (quotationObj.quotationCreationDt) {
        quotationObj.quotationCreationDt = new Date(quotationObj.quotationCreationDt);
        var first = firstTime;
        $("#quotationCreationDt").datepicker("setDate", quotationObj.quotationCreationDt.format("DD-MM-YYYY") );
        firstTime = first;
    }
    if (quotationObj.quotationUpdateDt) {
        quotationObj.quotationUpdateDt = new Date(quotationObj.quotationUpdateDt);
        $("#quotationUpdateDt").html(quotationObj.quotationUpdateDt.format("DD-MM-YYYY HH:mm") );
    } else {
        $("#quotationUpdateDt").html("<i>Nouveau</i>");
    }
    if (quotationObj.quotationEndValidityDt) {
        quotationObj.quotationEndValidityDt = new Date(quotationObj.quotationEndValidityDt);
        $("#quotationEndValidityDt").datepicker("setDate", quotationObj.quotationEndValidityDt.format("DD-MM-YYYY") );
    }
    $("#quotationRef").keyup( function() {
        firstTime = false;
        quotationObj.quotationRef = $("#quotationRef").val();
    });
    $("#quotationCustomerNote").keyup( function() {
        firstTime = false;
        quotationObj.quotationCustomerNote = $("#quotationCustomerNote").val();
    });
    $("#quotationInternalNote").keyup( function() {
        firstTime = false;
        quotationObj.quotationInternalNote = $("#quotationInternalNote").val();
    });

    refreshStatus();

    // doc button for generate/refresh
    for(var i = 0; i < quotationObj.quotationDocList.length; i++) {
        $("#docgen" + quotationObj.quotationDocList[i].quotationId).click(
            function() {
                var i = $(this).attr("id").substr("docgen".length);
                $(".tab-content").append("<div class='modal modalmask'></div>");
                // ajax call to create the document on server side
                $.ajax(
                    "docGenerate",
                    {
                        success: function(data, status) {
                            if (data.generatedDoc == null) { // error
                                $(".modalmask").remove();
                                $("#pop").html("Création impossible");
                                $("#pop").dialog( {
                                    dialogClass: "popsuperup",
                                    title: "Erreur",
                                    buttons: [ {
                                        text: "OK",
                                        click: function() {
                                            $( this ).dialog( "close" );
                                            $(".modalmask").remove();
                                        }
                                    } ],
                                    modal: true }
                                );
                            } else {
                                $(".modalmask").remove();
                                $("#pop").html("Document créé");
                                $("#pop").dialog( {
                                    dialogClass: "popsuperup",
                                    title: "Génération de Document",
                                    buttons: [ {
                                        text: "OK",
                                        click: function() {
                                            var generatedDoc = JSON.parse(data.generatedDoc);
                                            $("#doclink" + generatedDoc.quotationId).html("<a href='" + generatedDoc.docURL + "' target='_blank'><span class='glyphicon glyphicon-file red'></span></a> <a href='mailto:" + quotationObj.customerObj.personObj.personContactMail + "?subject=AuPaintSpace&attachment=" + dirname + generatedDoc.docURL + "' target='_blank'><span class='glyphicon glyphicon-share'></span></a>");
                                            $("#docgen" + generatedDoc.quotationId).html("Régénérer <span class='glyphicon glyphicon-refresh'></span>");
                                            $( this ).dialog( "close" );
                                        }
                                    } ],
                                    modal: true }
                                );
                            }
                        },
                        contentType: 'application/json',
                        data: JSON.stringify({ "quotationObj": quotationObj, "generateDocFor": i}),
                        error: function(data, status, err) {
                            $(".modalmask").remove();
                            $("#pop").html("Erreur lors de la transmission de données (doc) : " + err);
                            $("#pop").dialog( {
                                dialogClass: "popsuperup",
                                title: "Erreurs",
                                buttons: [ {
                                    text: "OK",
                                    click: function() {
                                        $( this ).dialog( "close" );
                                        $(".modalmask").remove();
                                    }
                                } ],
                                modal: true }
                            );
                        },
                        type: "POST"
                    }
                );
                return false;
            }
        );
        $("#docbackup" + quotationObj.quotationDocList[i].quotationId).click(
            function() {
                var i = $(this).attr("id").substr("docbackup".length);
                $(".tab-content").append("<div class='modal modalmask'></div>");
                // notification for the user
                $("#pop").html("Vous allez reprendre une ancienne version et la remettre en version courante (copie intégrale).<br/><br/>Voulez-vous vraiment continuer ?");
                $("#pop").dialog( {
                    dialogClass: "popsuperup",
                    title: "Back-up de Version",
                    width: 500,
                    beforeClose: function(event, ui) {
                            $(".modalmask").remove();
                    },
                    buttons: [
                        {
                        text: "Annuler",
                        click: function() {
                            $( this ).dialog( "close" );
                        }
                        } , {
                        text: "OUI",
                        click: function() {
                            $( this ).dialog( "close" );
                            // ajax call to create the copy on server side
                            $.ajax(
                                "quotationCopy",
                                {
                                    success: function(data, status) {
                                        if (data == "0") { // error
                                            $(".modalmask").remove();
                                            $("#pop").html("Back-up impossible");
                                            $("#pop").dialog( {
                                                dialogClass: "popsuperup",
                                                title: "Erreur",
                                                buttons: [ {
                                                    text: "OK",
                                                    click: function() {
                                                        $( this ).dialog( "close" );
                                                        $(".modalmask").remove();
                                                    }
                                                } ],
                                                modal: true }
                                            );
                                        } else {
                                            $(".modalmask").remove();
                                            $("#pop").html("Back-up effectué");
                                            $("#pop").dialog( {
                                                dialogClass: "popsuperup",
                                                title: "OK",
                                                buttons: [ {
                                                    text: "OK",
                                                    click: function() {
                                                        $(".tab-content").append("<div class='modal modalmask'></div>");
                                                        window.location.href = "/quotation?quotationId=" + data;
                                                        $( this ).dialog( "close" );
                                                    }
                                                } ],
                                                modal: true }
                                            );
                                        }
                                    },
                                    contentType: 'application/json',
                                    data: JSON.stringify({ "quotationObj": quotationObj, "copyFrom": i}),
                                    error: function(data, status, err) {
                                        $(".modalmask").remove();
                                        $("#pop").html("Erreur lors de la transmission de données (backup) : " + err);
                                        $("#pop").dialog( {
                                            dialogClass: "popsuperup",
                                            title: "Erreurs",
                                            buttons: [ {
                                                text: "OK",
                                                click: function() {
                                                    $( this ).dialog( "close" );
                                                    $(".modalmask").remove();
                                                }
                                            } ],
                                            modal: true }
                                        );
                                    },
                                    type: "POST"
                                }
                            );
                        }
                    } ],
                    modal: true }
                );
                return false;
            }
        );
    }
};

var refreshStatus = function() {
    calculateStatus();
    $("#quotationStatus").html( quotationObj.quotationStatus );
};

var calculateStatus = function() {
    quotationObj.quotationStatus = calculateStatusText(quotationObj);
};

var calculateStatusText = function(obj) {
    var today = new Date();
    today.setHours(12);
    today.setMinutes(0);
    today.setSeconds(0);

    if (obj.quotationCreationDt) obj.quotationCreationDt = new Date(obj.quotationCreationDt);
    if (obj.quotationUpdateDt) obj.quotationUpdateDt = new Date(obj.quotationUpdateDt);
    if (obj.quotationEndValidityDt) obj.quotationEndValidityDt = new Date(obj.quotationEndValidityDt);

    obj.quotationCreationDt.setHours(1);
    obj.quotationCreationDt.setMinutes(0);
    obj.quotationCreationDt.setSeconds(0);

    obj.quotationEndValidityDt.setHours(23);
    obj.quotationEndValidityDt.setMinutes(0);
    obj.quotationEndValidityDt.setSeconds(0);

    // 1 QUOTATION
    if (obj.quotationType == -1) {
        if (today < obj.quotationCreationDt)                                                return "<i>Devis Prévisionnel</i>";     // not started
        else if (today >= obj.quotationCreationDt && today <= obj.quotationEndValidityDt)   return "Devis en cours";                // in progress
        else if (today > obj.quotationCreationDt && today > obj.quotationEndValidityDt)     return "Devis plus valable";            // no more valable
        else                                                                                return "Devis";                         // quotation ?
    } else { // 2 INVOICE
        if (today < obj.quotationCreationDt)                                                return "<i>Facture Prévisionnelle</i>"; // not started
        if (today >= obj.quotationCreationDt) {
            var total = 0;
            for(var i = 0; i < obj.quotationPrestaList.length; i++) {
                if (obj.quotationPrestaList[i].productObj) {
                    var subtotal = obj.quotationPrestaList[i].productObj.productTTC * obj.quotationPrestaList[i].prestaQuantity;
                    var discount = (obj.quotationPrestaList[i].prestaDiscount > 0 ? ((100 - obj.quotationPrestaList[i].prestaDiscount ) / 100.0) : 1);

                    subtotal *= discount;
                    total += subtotal;
                }
            }
            if (obj.quotationGlobalDiscount) total -= obj.quotationGlobalDiscount;
            total = rounded(total);
            var remaining = total;
            if (obj.quotationRealDeposite) remaining -= obj.quotationRealDeposite;

            for(var i = 0; i < obj.quotationPaymentList.length; i++) {
                remaining = remaining - obj.quotationPaymentList[i].paymentAmount;
            }
            remaining = rounded(remaining);

            if (total <= 0)                                                             return "<i>Facture Vide !</i>";                     // empty !
            else if (remaining > 0)                                                     return "Facture en cours";                          // in progress
            else if (remaining == 0)                                                    return "<b>Facture Réglée</b>";                     // closed (fully paid)
            else if (remaining < 0)                                                     return "<b class='red'>Facture trop perçue !</b>";  // too much paid !
            else                                                                        return "Facture";                                   // invoice ?
        }
    }
    return "plop";
};


// ********************************************************************************************************
// VALIDATE QUOTATION
// ********************************************************************************************************

var validateQuotation = function() {
    // protect from update after clicking
    $(".tab-content").append("<div class='modal modalmask'></div>");

    // should we validate the current quotation ?

    var error = "";
    if (!quotationObj.customerObj)                      error += " - Pas de Client choisi !<br/>";
    if (quotationObj.quotationPrestaList.length == 0)   error += " - Pas de Prestation !<br/>";
    if (!quotationObj.payCondObj)                       error += " - Pas de Condition de Paiment choisie !<br/>";

    if (firstTime) {
        $("#pop").html("<b>Aucun changement à sauvegarder !</b>");
        $("#pop").dialog( {
            dialogClass: "popsuperup",
            title: "Erreur",
            beforeClose: function(event, ui) {
                    $(".modalmask").remove();
            },
            buttons: [ {
                text: "OK",
                click: function() {
                    $( this ).dialog( "close" );
                    $(".modalmask").remove();
                }
            } ],
            modal: true }
        );
    } else if (error !== "") {
        $("#pop").html("<b>Impossible d'enregistrer</b> :<br/><br/>" + error);
        $("#pop").dialog( {
            dialogClass: "popsuperup",
            title: "Erreurs",
            buttons: [ {
                text: "OK",
                click: function() {
                    $( this ).dialog( "close" );
                    $(".modalmask").remove();
                }
            } ],
            modal: true }
        );
    } else {
        // check unicity of Reference
        $.ajax(
            "quotationUnicity",
            {
                success: function(data, status) {
                    if (data == "0") { // not unique !
                        $(".modalmask").remove();
                        $("#pop").html("Création impossible : la Référence <b>" + quotationObj.quotationRef + "</b> existe déjà !");
                        $("#pop").dialog( {
                            dialogClass: "popsuperup",
                            title: "Erreur",
                            buttons: [ {
                                text: "OK",
                                click: function() {
                                    $( this ).dialog( "close" );
                                }
                            } ],
                            modal: true }
                        );
                    } else {
                        // unique or update, so let send to the server
                        $.ajax(
                            "/quotationUpdate",
                            {
                                success: function(data, status) {
                                    if (data == "0") { // something has not working
                                        $(".modalmask").remove();
                                        $("#pop").html("Erreur lors de la transmission de données");
                                        $("#pop").dialog( {
                                            dialogClass: "popsuperup",
                                            title: "Erreurs",
                                            buttons: [ {
                                                text: "OK",
                                                click: function() {
                                                    $( this ).dialog( "close" );
                                                }
                                            } ],
                                            modal: true }
                                        );
                                    } else {
                                        $(".modalmask").remove();
                                        $("#pop").html("Sauvegardé");
                                        $("#pop").dialog( {
                                            dialogClass: "popsuperup",
                                            title: "OK",
                                            buttons: [ {
                                                text: "OK",
                                                click: function() {
                                                    $(".tab-content").append("<div class='modal modalmask'></div>");
                                                    window.location.href = "/quotation?quotationId=" + data;
                                                    $( this ).dialog( "close" );
                                                }
                                            } ],
                                            modal: true }
                                        );
                                    }
                                },
                                contentType: 'application/json',
                                data: JSON.stringify(quotationObj),
                                error: function(data, status, err) {
                                    $(".modalmask").remove();
                                    $("#pop").html("Erreur lors de la transmission de données : " + err);
                                    $("#pop").dialog( {
                                        dialogClass: "popsuperup",
                                        title: "Erreurs",
                                        buttons: [ {
                                            text: "OK",
                                            click: function() {
                                                $( this ).dialog( "close" );
                                            }
                                        } ],
                                        modal: true }
                                    );
                                },
                                type: "POST"
                            }
                        );
                    }
                },
                contentType: 'application/json',
                data: JSON.stringify(quotationObj),
                error: function(data, status, err) {
                    $(".modalmask").remove();
                    $("#pop").html("Erreur lors de la transmission de données (unicity) : " + err);
                    $("#pop").dialog( {
                        dialogClass: "popsuperup",
                        title: "Erreurs",
                        buttons: [ {
                            text: "OK",
                            click: function() {
                                $( this ).dialog( "close" );
                            }
                        } ],
                        modal: true }
                    );
                },
                type: "POST"
            }
        );
    }
};

var convertToInvoice = function() {
    $(".tab-content").append("<div class='modal modalmask'></div>");
    // notification for the user
    $("#pop").html("Vous allez transformer ce devis en Facture.<br/><br/>Ceci validera automatiquement le client sans retour arrière possible (y compris lors d'un back-up).<br/><br/>Pensez à changer les données comme la <b>Date de Valeur du Devis</b> (qui deviendra la future date de facture) pour éviter une version à vide avant de convertir<br/><br/>Voulez-vous vraiment continuer ?");
    $("#pop").dialog( {
        dialogClass: "popsuperup",
        title: "Conversion",
        width: 500,
        beforeClose: function(event, ui) {
                $(".modalmask").remove();
        },
        buttons: [
            {
            text: "Annuler",
            click: function() {
                $( this ).dialog( "close" );
                $(".modalmask").remove();
            }
            } , {
            text: "OUI",
            click: function() {
                $( this ).dialog( "close" );
                // ajax call to create the copy on server side
                $.ajax(
                    "quotationConvert",
                    {
                        success: function(data, status) {
                            if (data == "0") { // error
                                $(".modalmask").remove();
                                $("#pop").html("Conversion impossible");
                                $("#pop").dialog( {
                                    dialogClass: "popsuperup",
                                    title: "Erreur",
                                    buttons: [ {
                                        text: "OK",
                                        click: function() {
                                            $( this ).dialog( "close" );
                                            $(".modalmask").remove();
                                        }
                                    } ],
                                    modal: true }
                                );
                            } else {
                                $(".modalmask").remove();
                                $("#pop").html("Conversion effectuée");
                                $("#pop").dialog( {
                                    dialogClass: "popsuperup",
                                    title: "OK",
                                    buttons: [ {
                                        text: "OK",
                                        click: function() {
                                            $(".tab-content").append("<div class='modal modalmask'></div>");
                                            window.location.href = "/quotation?quotationId=" + data;
                                            $( this ).dialog( "close" );
                                        }
                                    } ],
                                    modal: true }
                                );
                            }
                        },
                        contentType: 'application/json',
                        data: JSON.stringify({ "quotationObj": quotationObj }),
                        error: function(data, status, err) {
                            $(".modalmask").remove();
                            $("#pop").html("Erreur lors de la transmission de données (conversion) : " + err);
                            $("#pop").dialog( {
                                dialogClass: "popsuperup",
                                title: "Erreurs",
                                buttons: [ {
                                    text: "OK",
                                    click: function() {
                                        $( this ).dialog( "close" );
                                        $(".modalmask").remove();
                                    }
                                } ],
                                modal: true }
                            );
                        },
                        type: "POST"
                    }
                );
            }
        } ],
        modal: true }
    );
    return false;
};
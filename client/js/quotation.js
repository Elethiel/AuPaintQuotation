
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

    $("#customerexisttab").dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_customer.lang" },
                "dom":              '<<"H"r<"#CustomerHeader">f>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#CustomerHeader").html("<b>Clients</b>") },
                "order":            [[ 2, "asc" ]],
                "columnDefs": [
                    {
                        "width": 20,
                        "targets": 0
                    },
                    {
                        "width": 40,
                        "type": "title-string",
                        "targets": [1]
                    },
                    {
                        "sClass": "text-left",
                        "targets": [2]
                    },
                    {
                        "width": 36,
                        "targets": [3] ,
                        "sortable": false,
                        "searchable": false
                    }
                ]
    } );

    // the "SELECT CUSTOMER" button
    maxCustomer = $("#maxCustomer").val();
    if (maxCustomer && maxCustomer > 0) {
        for (var i = 0; i < maxCustomer; i++) {
            // select
            $("#selectCust" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                $("#quotationSelectedCustomerId").val($("#idCustomer" + n).html());
                $("#quotationSelectedCustomer").html("<b>" + $("#labelCustomer" + n).html() + "</b>");
                $("#quotationSelectedCustomer").addClass("midfield");
                $("#unselectCust").removeClass("hide");
                $("#unselectCust").show();
                checkValidityCustomer();
                return false;
            });
        }
    }
    // unselect
    $("#unselectCust").click( function() {
        $("#quotationSelectedCustomerId").val("");
        $("#quotationSelectedCustomer").html("");
        $("#quotationSelectedCustomer").removeClass("midfield");
        $("#unselectCust").removeClass("show");
        $("#unselectCust").hide();
        checkValidityCustomer();
        return false;
    });

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
    $("#quotationForm").bootstrapValidator( { excluded: [ function($field, validator) {
            if ($("#customerType").val() == -1) {
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
    $("#quotationPersonFirstname").keyup(function(){
        $("#quotationForm").bootstrapValidator("revalidateField", "quotationPersonLastname");
    });
    $("#quotationPersonLastname").keyup(function(){
        $("#quotationForm").bootstrapValidator("revalidateField", "quotationPersonFirstname");
    });
    // select box "customer Type"
    for (var i = 0; i < $("#maxquotationCustomerTypeList").val(); i++) {
        $("#optionquotationCustomerType" + i).click(quotationCustomerTypeSelect);
    }
    // select box "company legal"
    for (var i = 0; i < $("#maxquotationCompanyLegalList").val(); i++) {
        $("#optionquotationCompanyLegal" + i).click(legalSelect);
    }
    // select box "person Gender"
    for (var i = 0; i < $("#maxquotationPersonGenderList").val(); i++) {
        $("#optionquotationPersonGender" + i).click(genderSelect);
    }
    $("#quotationCustomerNew-0").click(clickOnNew);
    $("#quotationCustomerNew-1").click(clickOnExisting);
};

var quotationCustomerTypeSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optionquotationCustomerType".length);
    // update hidden field
    $("#quotationCustomerType").val($("#optionvalquotationCustomerType" + i).val());
    $("#selectquotationCustomerType").html($(this).html());
    if (i == 0) clickOnMoral();
    else if (i == 1) clickOnPhysical();
    $("#quotationForm").bootstrapValidator("revalidateField", "quotationCustomerType");
    $("#selectDropquotationCustomerType").click();
    return false;
};

var clickOnNew = function() {
    $("#existingCustomerDiv").removeClass("show");
    $("#existingCustomerDiv").hide();
    $("#newCustomerDiv").removeClass("hide");
    $("#newCustomerDiv").show();
    checkValidityCustomer();
};

var clickOnExisting = function() {
    $("#existingCustomerDiv").removeClass("hide");
    $("#existingCustomerDiv").show();
    $("#newCustomerDiv").removeClass("show");
    $("#newCustomerDiv").hide();
    checkValidityCustomer();
};

var checkValidityCustomer = function() {
    if ($("#quotationCustomerNew-0").prop('checked')) { // new
        uncheckCust();
    } else { // existing
        if ($("#quotationSelectedCustomerId").val() != "" && $("#quotationSelectedCustomerId").val() > 0) { // someone selected
            checkCust();
        } else { // nothing selected
            uncheckCust();
        }
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
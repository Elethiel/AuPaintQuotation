
var customerInitTab = function () {
    $("#customertab").dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_customer.lang" },
                "dom":              '<T<"H"r<"#CustomerHeader">>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#CustomerHeader").html("<b>Clients</b>") },
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
                        "width": 250,
                        "sClass": "text-left",
                        "targets": [3]
                    },
                    {
                        "width": 36,
                        "targets": [4] ,
                        "sortable": false,
                        "searchable": false
                    }
                ]
    } );

    $("#addCustomer").click( function() {
        window.location.href='/customer';
    });

    // update/delete for Customer
    maxCustomer = $("#maxCustomer").val();
    if (maxCustomer && maxCustomer > 0) {
        for (var i = 0; i < maxCustomer; i++) {
            $("#delCustomer" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                // update the content of popup before showing
                popup.updateForDelete($("#labelCustomer" + n).html(), "ce Client", "/customerDel?customerId=", $("#idCustomer" + n).html());
                popup.show();
            });
        }
    }
};

var customerValidator = function() {
    $.fn.bootstrapValidator.validators.atLeastOne = {
        validate: function(validator, $field, options) {
            if ($field.val().replace(/^\s+|\s+$/gm,'') != "") return true; // at least one not null OK
            if ($field.attr("id") === "personFirstname") {
                if ($("#personLastname").val() != "") return true;
            } else if ($field.attr("id") === "personLastname") {
                if ($("#personFirstname").val() != "") return true;
            }
            return false;
        }
    };
    $("#customerForm").bootstrapValidator( { excluded: [ function($field, validator) {
            if ($("#customerType").val() == -1) {
                return false; // valide all if "type company"
            } else { // if not selected or "type person"
                if (($field.attr("id") == "companyLegal") || ($field.attr("id") == "companyName")) {
                    return true;
                }
                return false;
            }
        } ] ,
        fields: {
                personFirstname: {
                        validators: {
                            atLeastOne: { message: "Merci de remplir au moins l'un des deux champs !" }
                        }
                    },
                personLastname: {
                        validators: {
                            atLeastOne: { message: "Merci de remplir au moins l'un des deux champs !" }
                        }
                    }
                }
        });
    $('#backBut').click(function() {
        window.location.href='/customerMenu';
    });
    $('#backButMain').click(function() {
        window.location.href='/customerMenu';
    });
    $("#personFirstname").keyup(function(){
        $("#customerForm").bootstrapValidator("revalidateField", "personLastname");
    });
    $("#personLastname").keyup(function(){
        $("#customerForm").bootstrapValidator("revalidateField", "personFirstname");
    });
    // select box "customer Type"
    for (var i = 0; i < $("#maxcustomerTypeList").val(); i++) {
        $("#optioncustomerType" + i).click(customerTypeSelect);
    }
    // select box "company legal"
    for (var i = 0; i < $("#maxcompanyLegalList").val(); i++) {
        $("#optioncompanyLegal" + i).click(legalSelect);
    }
    // select box "person Gender"
    for (var i = 0; i < $("#maxpersonGenderList").val(); i++) {
        $("#optionpersonGender" + i).click(genderSelect);
    }
};

var customerTypeSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optioncustomerType".length);
    // update hidden field
    $("#customerType").val($("#optionvalcustomerType" + i).val());
    $("#selectcustomerType").html($(this).html());
    if (i == 0) clickOnMoral();
    else if (i == 1) clickOnPhysical();
    $("#customerForm").bootstrapValidator("revalidateField", "customerType");
    $("#selectDropcustomerType").click();
    return false;
};

var legalSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optioncompanyLegal".length);
    $("#companyLegal").val($("#optionvalcompanyLegal" + i).val());
    $("#selectcompanyLegal").html($(this).html());
    $("#customerForm").bootstrapValidator("revalidateField", "companyLegal");
    $("#selectDropcompanyLegal").click();
    return false;
};

var genderSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optionpersonGender".length);
    $("#personGender").val($("#optionvalpersonGender" + i).val());
    $("#selectpersonGender").html($(this).html());
    $("#customerForm").bootstrapValidator("revalidateField", "personGender");
    $("#selectDroppersonGender").click();
    return false;
};

var clickOnMoral = function() {
    $("#companyArea").removeClass("hidden");
    $("#companyArea").show();
    $("#personTitle").html("Contact Principal");
    $("#personArea").removeClass("hidden");
    $("#personArea").show();
};

var clickOnPhysical = function() {
    $("#companyArea").removeClass("show");
    $("#companyArea").hide();
    $("#personTitle").html("Personne Physique");
    $("#personArea").removeClass("hidden");
    $("#personArea").show();
};
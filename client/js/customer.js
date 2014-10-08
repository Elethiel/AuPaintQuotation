
var customerInitTab = function () {
    $("#customertab").dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_customer.lang" },
                "dom":              '<T<"H"r<"#CustomerHeader">f>t<"F"i>',
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
                        "className": "text-left",
                        "targets": [2]
                    },
                    {
                        "width": 250,
                        "className": "text-left",
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
                return false;
            });
        }
    }

    $("#filterProspect").click( function() {
        if ($("#filterProspect").prop("checked")) {
            $(".opacitedTR").hide();
        } else {
            $(".opacitedTR").show();
        }
    });
};

var customerValidator = function() {
    $.fn.bootstrapValidator.validators.atLeastOne = {
        validate: function(validator, $field, options) {
            if ($field.val().replace(/^\s+|\s+$/gm,'') != "") return true; // at least one not null OK
            if ($field.attr("id") === "personFirstname") {
                if ($("#personLastname").val() != "") return true;
            } else if ($field.attr("id") === "personLastname") {
                if ($("#personFirstname").val() != "") return true;
            } else if ($field.attr("id") === "ctcPersonLastname") {
                if ($("#ctcPersonFirstname").val() != "") return true;
            } else if ($field.attr("id") === "ctcPersonFirstname") {
                if ($("#ctcPersonLastname").val() != "") return true;
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

    $("#persontab").dataTable( {
                "jQueryUI":         true,
                "language":         { "url": "./js/datatables_contact.lang" },
                "dom":              '<T<"H"r<"#PersonHeader">>t<"F"i>',
                "iDisplayLength":   -1,
                "fnInitComplete":   function() { $("#PersonHeader").html("<b>Contacts</b>") },
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
                        "className": "text-left",
                        "targets": [1]
                    },
                    {
                        "width": 250,
                        "className": "text-left",
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
    // update/delete for Contact
    maxPerson = $("#maxPerson").val();
    if (maxPerson && maxPerson > 0) {
        for (var i = 0; i < maxPerson; i++) {
            // delete
            $("#delPerson" + i).click(function () {
                var n = $( this ).attr('href').substring(1);
                // update the content of popup before showing
                popup.updateForDelete($("#labelPerson" + n).html(), "ce Contact", "/customerDelPerson?customerId=" + $("#customerId").val() + "&personId=", $("#idPerson" + n).html());
                popup.show();
                return false;
            });
            // update
            $("#updatePerson" + i).click(function () {
                var i = $( this ).attr('href').substring(1);
                updatePerson(i);
                return false;
            });
        }
    }
    $("#cancelBut").click( function() {
        $("#addPersonDiv").removeClass("show");
        $("#addPersonDiv").hide();
        $("#cancelBut").removeClass("show");
        $("#cancelBut").hide();
    });

    // add a new contact
    $("#addPerson").click( function() {
        // need to clear all inputs of the form
        $("#ctcPersonId").val("");
        $("#ctcPersonGender").val("");
        $("#selectctcPersonGender").html("Sélectionnez une Civilité");
        $("#ctcPersonFirstname").val("");
        $("#ctcPersonLastname").val("");
        $("#ctcPersonAddressId").val("");
        $("#ctcPersonContactId").val("");
        $("#ctcPersonContactTel").val("");
        $("#ctcPersonContactMobile").val("");
        $("#ctcPersonContactFax").val("");
        $("#ctcPersonContactMail").val("");
        $("#addPersonDiv").removeClass("hide");
        $("#addPersonDiv").show();
        $("#cancelBut").removeClass("hide");
        $("#cancelBut").show();
        return false;
    });

    // the add contact form
    $("#contactForm").bootstrapValidator( { excluded: [],
        fields: {
                ctcPersonFirstname: {
                        validators: {
                            atLeastOne: { message: "Merci de remplir au moins l'un des deux champs !" }
                        }
                    },
                ctcPersonLastname: {
                        validators: {
                            atLeastOne: { message: "Merci de remplir au moins l'un des deux champs !" }
                        }
                    }
                }
        });

    // select box "person Gender"
    for (var i = 0; i < $("#maxctcPersonGenderList").val(); i++) {
        $("#optionctcPersonGender" + i).click(genderctcSelect);
    }
};

var updatePerson = function(i) {
    // need to clear all inputs of the form
    $("#ctcPersonId").val($("#cPId" + i).val());
    $("#ctcPersonGender").val($("#cPGender" + i).val());
    $("#selectctcPersonGender").html($("#cPGender" + i).val());
    $("#ctcPersonFirstname").val($("#cPFirstname" + i).val());
    $("#ctcPersonLastname").val($("#cPLastname" + i).val());
    $("#ctcPersonAddressId").val($("#cAId" + i).val());
    $("#ctcPersonContactId").val($("#cCId" + i).val());
    $("#ctcPersonContactTel").val($("#cPTel" + i).val());
    $("#ctcPersonContactMobile").val($("#cPMobile" + i).val());
    $("#ctcPersonContactFax").val($("#cPFax" + i).val());
    $("#ctcPersonContactMail").val($("#cPMail" + i).val());
    $("#addPersonDiv").removeClass("hide");
    $("#addPersonDiv").show();
    $("#cancelBut").removeClass("hide");
    $("#cancelBut").show();
    return false;
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

var genderctcSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optionctcPersonGender".length);
    $("#ctcPersonGender").val($("#optionvalctcPersonGender" + i).val());
    $("#selectctcPersonGender").html($(this).html());
    $("#contactForm").bootstrapValidator("revalidateField", "ctcPersonGender");
    $("#selectDropctcPersonGender").click();
    return false;
};

var clickOnMoral = function() {
    $("#companyArea").removeClass("hide");
    $("#companyArea").show();
    $("#personTitle").html("Contact Principal");
    $("#personArea").removeClass("hide");
    $("#personArea").show();
};

var clickOnPhysical = function() {
    $("#companyArea").removeClass("show");
    $("#companyArea").hide();
    $("#personTitle").html("Personne Physique");
    $("#personArea").removeClass("hide");
    $("#personArea").show();
};
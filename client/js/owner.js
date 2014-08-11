var ownerFormValidator = function() {
    $('#ownerForm').bootstrapValidator( { excluded: [] } );
    $('input[type=file]').bootstrapFileInput();
    $('.file-inputs').bootstrapFileInput();
    // select box "company legal"
    for (var i = 0; i < $("#maxcompanyLegalList").val(); i++) {
        $("#optioncompanyLegal" + i).click(legalSelect);
    }
    // select box "fiscale Dt"
    for (var i = 0; i < $("#maxownerFiscalDtList").val(); i++) {
        $("#optionownerFiscalDt" + i).click(fiscalSelect);
    }
};

var legalSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optioncompanyLegal".length);
    $("#companyLegal").val($("#optionvalcompanyLegal" + i).val());
    $("#selectcompanyLegal").html($(this).html());
    $("#ownerForm").bootstrapValidator("revalidateField", "companyLegal");
    $("#selectDropcompanyLegal").click();
    return false;
};

var fiscalSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optionownerFiscalDt".length);
    $("#ownerFiscalDt").val($("#optionvalownerFiscalDt" + i).val());
    $("#selectownerFiscalDt").html($(this).html());
    $("#ownerForm").bootstrapValidator("revalidateField", "ownerFiscalDt");
    $("#selectDropownerFiscalDt").click();
    return false;
};
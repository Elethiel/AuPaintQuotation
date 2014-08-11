var groupProductValidator = function() {
    $('#groupProductForm').bootstrapValidator( { excluded: [] } );
    $('#backBut').click(function() {
        window.location.href='/managementMenu?subLoc=groupProduct';
    });
    // select box "tva"
    for (var i = 0; i < $("#maxTVAIdList").val(); i++) {
        $("#optionTVAId" + i).click(tvaSelect);
    }
    $('input[type=file]').bootstrapFileInput();
    $('.file-inputs').bootstrapFileInput();
};

var tvaSelect = function() {
    // retrieve "i"
    var i = $(this).attr("id").substring("optionTVAId".length);
    $("#TVAId").val($("#optionvalTVAId" + i).val());
    $("#selectTVAId").html($(this).html());
    $("#groupProductForm").bootstrapValidator("revalidateField", "TVAId");
    $("#selectDropTVAId").click();
    return false;
};
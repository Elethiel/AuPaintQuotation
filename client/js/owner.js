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
    $("#ownerPattern").keyup( refreshPattern );
    refreshPattern();
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

var refreshPattern = function () {
    if ( JStrim($("#ownerPattern").val()) != "" ) {
        // $yy$ = current year (or iso year if week)
        // $mm$ = current month
        // $ss$ = current week
        // $dd$ = current day
        // # = uniq ID
        var patternRender = JStrim($("#ownerPattern").val());
        var month = "00" + (new Date().getMonth() + 1);
        month = month.substr(month.length - 2);
        patternRender = patternRender.replace(/\$mm\$/gi, month);
        var day = "00" + (new Date().getDate());
        day = day.substr(day.length - 2);
        patternRender = patternRender.replace(/\$dd\$/gi, day);
        if (!patternRender.match(/\$ss\$/gi)) {
            patternRender = patternRender.replace(/\$yy\$/gi, new Date().getFullYear());
        } else {
            patternRender = patternRender.replace(/\$ss\$/gi, new Date().getWeek());
            patternRender = patternRender.replace(/\$yy\$/gi, new Date().getWeekYear());
        }

        // manage the uniq id (from client side it's only replace by "0000001")
        if (patternRender.match(/######/gi)) {
            patternRender = patternRender.replace(/######/gi, "000001");
        } else if (patternRender.match(/#####/gi)) {
            patternRender = patternRender.replace(/#####/gi, "00001");
        } else if (patternRender.match(/####/gi)) {
            patternRender = patternRender.replace(/####/gi, "0001");
        } else if (patternRender.match(/###/gi)) {
            patternRender = patternRender.replace(/###/gi, "001");
        } else if (patternRender.match(/##/gi)) {
            patternRender = patternRender.replace(/##/gi, "01");
        } else if (patternRender.match(/#/gi)) {
            patternRender = patternRender.replace(/#/gi, "1");
        }

        $("#ownerPatternRender").html( patternRender );
    }
};
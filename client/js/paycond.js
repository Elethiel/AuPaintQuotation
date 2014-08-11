var payCondValidator = function() {
    $('#payCondForm').bootstrapValidator( { excluded: [] } );
    $('#backBut').click(function() {
        window.location.href='/managementMenu?subLoc=payCond';
    });
};
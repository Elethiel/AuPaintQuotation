var payTypeValidator = function() {
    $('#payTypeForm').bootstrapValidator( { excluded: [] } );
    $('#backBut').click(function() {
        window.location.href='/managementMenu?subLoc=payType';
    });
};
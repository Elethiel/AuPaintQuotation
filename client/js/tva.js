var tvaValidator = function() {
    $('#tvaForm').bootstrapValidator( { excluded: [] } );
    $('#backBut').click(function() {
        window.location.href='/managementMenu?subLoc=TVA';
    });
};
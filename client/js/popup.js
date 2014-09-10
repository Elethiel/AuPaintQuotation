var Popup = function() {};

Popup.prototype.update = function(title, message, button1, button2, act) {
    this.updateJS(title, message, button1, button2, act, false);
};

Popup.prototype.updateJS = function(title, message, button1, button2, act, asJS) {
    if ($("#myModal")) {
        // set the new title
        $("#modalTitle").html(title);
        // set the new message
        $("#modalMessage").html(message);
        // manage button
        if (!button1 && !button2) {
            $("#modalButtons").hide();
        } else {
            if (button1) $("#Button1").html(button1);
            else $("#Button1").hide();
            if (button2) {
                $("#Button2").html(button2);
                // action as JS or not
                if (asJS) {
                    $("#Button2").click(act);
                }
                else {
                    $("#Button2").click(function () {
                        window.location.href=act;
                    });
                }
            } else $("#Button2").hide();
        }
    }
};


Popup.prototype.updateForDelete = function(label, txt, url, id) {
    this.update(    "Supprimer",
                    "Voulez-vous vraiment supprimer " + txt + " ?<br/>&nbsp;<br/><div class='text-center'><strong><em>« " + label + " »</em></strong></div>",
                    "Annuler",
                    "Supprimer",
                    url + id);
};

Popup.prototype.show = function() {
    $('#myModal').modal( {backdrop: 'static', show: true} );
};
Popup.prototype.hide = function() {
    $('#myModal').modal( 'hide' );
};

var popup = new Popup();

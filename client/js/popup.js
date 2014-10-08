var Popup = function() {};

Popup.prototype.update = function(title, message, button1, button2, act) {
    this.updateJS(title, message, button1, button2, act, false);
};
Popup.prototype.update2 = function(title, message, button1, button2, act) {
    this.updateJS2(title, message, button1, button2, act, false);
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
Popup.prototype.updateJS2 = function(title, message, button1, button2, act, asJS) {
    if ($("#myModal2")) {
        // set the new title
        $("#modalTitle2").html(title);
        // set the new message
        $("#modalMessage2").html(message);
        // manage button
        if (!button1 && !button2) {
            $("#modalButtons2").hide();
        } else {
            if (button1) $("#Button21").html(button1);
            else $("#Button21").hide();
            if (button2) {
                $("#Button22").html(button2);
                // action as JS or not
                if (asJS) {
                    $("#Button22").click(act);
                }
                else {
                    $("#Button22").click(function () {
                        window.location.href=act;
                    });
                }
            } else $("#Button22").hide();
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
    $("#myModal").modal( { backdrop: "static", show: true , position: { my: "center top", at: "center top", of: window } } );
};
Popup.prototype.hide = function() {
    $("#myModal").modal( "hide" );
};

Popup.prototype.show2 = function() {
    $("#myModal2").modal( { backdrop: "static", show: true , position: { my: "center top", at: "center top", of: window } } );
};
Popup.prototype.hide2 = function() {
    $("#myModal2").modal( "hide" );
};

var popup = new Popup();

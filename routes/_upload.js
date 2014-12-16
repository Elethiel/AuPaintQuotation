var lwip = require("lwip");
var util = require("util");

var imageAuth = [   /*"image/bmp",
                    "image/gif",*/
                    "image/jpeg"/*,
                    "image/png",
                    "image/tiff",
                    "image/x-win-bmp",
                    "image/x-xbitmap"*/ ];

module.exports = function(file, width, height, callback) {
    if (file) {
        var ok = false;
        for(var i = 0; i < imageAuth.length; i++) {
            ok = ok | (imageAuth[i] === file.mimetype)
        }
        if (!ok) {
            //console.log("Reject the file (" + file.type + ") " + file.originalname);
            callback("rej", null);
        } else {
            //console.log("Accept the file " + file.originalname);
            var newPath = "/uploads/" + (new Date().getTime()) + "-" + file.originalname.replace(" ", "_").toLowerCase();
            // for the proper size to prevent big images
            lwip.open(file.path, function(err, image) {
                if (!err) {
                    var ratio = 1;
                    if (image.height() > height) ratio = height / image.height();
                    if (image.width() > width && ratio > width / image.width()) ration = width / image.width();
                    // resize and rename image
                    image.batch().scale(ratio).writeFile("./client/" + newPath, function(err) {
                        if (!err) callback("ok", newPath);
                        else callback("nof", null);
                    });
                } else {
                    //console.log("Issue while uploading the file " + util.inspect(err, false, null));
                    callback("nof", null);
                }
            });
        }
    } else callback("ok", null);
};
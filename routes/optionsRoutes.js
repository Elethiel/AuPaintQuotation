var owner = require("../model/ownerObj");
var tva = require("../model/tvaObj");
var groupProduct = require("../model/groupProductObj");
var payType = require("../model/payTypeObj");
var payCond = require("../model/payCondObj");
var upload = require("../routes/_upload");
var util = require("util");
var lodash = require("lodash");
var fs = require("fs");

var maxForLogo = [200, 400];
var maxForIcon = [32, 48];

module.exports = function(app) {
    app.get("/ownerMenu", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config owner page (owner Form)

        // error from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            delete req.session.pstatus;
        }
        req.param.Obj = {};
        if (req.param.session.ownerObj) req.param.Obj = owner.getFlatVersion(req.param.session.ownerObj);
        // this occurs while some errors occurs on image uploads
        // prevents to loose form update for the user
        if (req.session.oldObj) {
            lodash.assign(req.param.Obj, req.session.oldObj);
            delete req.session.oldObj;
        }
        //console.log("OWNER = " + util.inspect(req.param.Obj, false, null));
        req.param.loc = "options";
        res.render("owner", {srv:  req.param });
        // ---------------------------------------------------------------------------------------------
    }).post("/ownerUpdate", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit config owner (process)
        req.body.ownerId = req.param.session.ownerId;
        if (req.body.adminName != "") {
            req.db.updateAdmin(req.body.adminName, function(err) {
                if (err) next(err);
                else req.session.username = req.body.adminName;
            } );
        }
        // at least one file to upload
        if (req.files && (req.files.ownerLogoFile || req.files.ownerBigLogoFile)) {
            upload(req.files.ownerLogoFile, maxForLogo[1], maxForLogo[0], function(st, path) {
                if (st === "rej" || st === "nok" || st === "nof") {
                    req.session.pstatus = st;
                    if (req.files.ownerLogoFile)        fs.unlink(req.files.ownerLogoFile.path);
                    if (req.files.ownerBigLogoFile)     fs.unlink(req.files.ownerBigLogoFile.path);
                    req.session.oldObj = req.body;
                    req.session.oldObj.ownerLogo = req.body.ownerLogo;
                    res.redirect("/ownerMenu");
                } else if (st === "ok") {
                    if (path) req.body.ownerLogo = path;
                    upload(req.files.ownerBigLogoFile, maxForLogo[1], maxForLogo[0], function(st, path) {
                        if (st === "rej" || st === "nok" || st === "nof") {
                            req.session.pstatus = st;
                            if (req.files.ownerLogoFile)        fs.unlink(req.files.ownerLogoFile.path);
                            if (req.files.ownerBigLogoFile)     fs.unlink(req.files.ownerBigLogoFile.path);
                            req.session.oldObj = req.body;
                            req.session.oldObj.ownerLogo = req.body.ownerLogo;
                            res.redirect("/ownerMenu");
                        } else if (st === "ok") {
                            if (path) req.body.ownerBigLogo = path;
                            if (req.files.ownerLogoFile)        fs.unlink(req.files.ownerLogoFile.path);
                            if (req.files.ownerBigLogoFile)     fs.unlink(req.files.ownerBigLogoFile.path);
                            owner.insertUpdate(req.db, req.body,  function(err, ret) {
                                if (err) next(err);
                                else {
                                    if (ret.msg !== "ok") {
                                        req.session.oldObj = req.body;
                                        req.session.oldObj.ownerLogo = req.body.ownerLogo;
                                    }
                                    req.session.pstatus = ret.msg;
                                    res.redirect("/ownerMenu");
                                }
                            }); // insert update owner
                        }
                    }); // upload big
                }
            }); // upload logo
        } else {
            //console.log("NO file ");
            owner.insertUpdate(req.db, req.body, function(err, ret) {
                if (err) next(err);
                else {
                    req.session.pstatus = ret.msg;
                    if (ret.msg !== "ok") {
                        req.session.oldObj = req.body;
                        req.session.oldObj.ownerLogo = req.body.ownerLogo;
                    }
                    res.redirect("/ownerMenu");
                }
            });
        }
        // ---------------------------------------------------------------------------------------------
    }).get("/managementMenu", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config tva/paytype/payCondition page (owner Form)
        req.param.subloc = "";

        // success from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            req.param.subloc = req.param.pstatus.substring(4);
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }
        if (!req.param.subloc) req.param.subloc = "TVA";
        if (req.query.subLoc) req.param.subloc = req.query.subLoc;
        req.param.loc = "options";

        req.param.tvaList = [];
        req.param.payTypeList = [];
        req.param.payCondList = [];
        req.param.groupProductList = [];
        tva.findAll(req.db, function(err, TVAList) {
            if (err) next(err);
            else {
                if (TVAList) req.param.TVAList = TVAList;
                payType.findAll(req.db, function(err, payTypeList) {
                    if (err) next(err);
                    else {
                        if (payTypeList) req.param.payTypeList = payTypeList;
                        payCond.findAll(req.db, function(err, payCondList) {
                            if (err) next(err);
                            else {
                                if (payCondList) req.param.payCondList = payCondList;
                                groupProduct.findAll(req.db, function(err, groupProductList) {
                                    if (err) next(err);
                                    else {
                                        if (groupProductList) req.param.groupProductList = groupProductList;
                                        res.render("management", {srv:  req.param} );
                                    }
                                }); // find groupproduct
                            }
                        }); // find paycond
                    }
                }); // find paytype
            }
        }); // find tva
        // ---------------------------------------------------------------------------------------------
    }).get("/tva", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config tva page (tva Form)

        // error from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }
        req.param.tvaObj = {};
        tva.findById(req.db, { TVAId: req.query.TVAId }, function(err, tvaObj) {
            if (err) next(err);
            else {
                req.param.Obj = tvaObj;
                if (req.session.oldObj) {
                    lodash.assign(req.param.Obj, req.session.oldObj);
                    delete req.session.oldObj;
                }
                //console.log("TVA = " + util.inspect(req.param.Obj, false, null));
                req.param.loc = "options";
                res.render("tva", {srv:  req.param} );
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).post("/tvaUpdate", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit config tva (process)
        tva.insertUpdate(req.db, req.body, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? (req.body.TVAId ? "upd-TVA" : "new-TVA") : ret.msg;
                if (ret.msg !== "ok") req.session.oldObj = req.body;
                if (ret.msg === "nok") res.redirect("/tva" + (req.body.TVAId ? "?TVAId=" + req.body.TVAId : ""));
                else res.redirect("/managementMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/tvaDel", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }

        tva.delById(req.db, { TVAId: req.query.TVAId }, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? "del-TVA" : ret.msg + "-TVA";
                req.session.pstatusvar = ret.TVANb ? ret.TVANb : 0;
                res.redirect("/managementMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/payType", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config payType page (payType Form)

        // error from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }
        req.param.Obj = {};
        payType.findById(req.db, { payTypeId: req.query.payTypeId }, function(err, payTypeObj) {
            if (err) next(err);
            else {
                req.param.Obj = payTypeObj;
                if (req.session.oldObj) {
                    lodash.assign(req.param.Obj, req.session.oldObj);
                    delete req.session.oldObj;
                }
                //console.log("payType = " + util.inspect(req.param.Obj, false, null));
                req.param.loc = "options";
                res.render("payType", {srv:  req.param} );
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).post("/payTypeUpdate", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit config payType (process)
        payType.insertUpdate(req.db, req.body, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? (req.body.payTypeId ? "upd-payType" : "new-payType") : ret.msg;
                if (ret.msg !== "ok") req.session.oldObj = req.body;
                if (ret.msg === "nok") res.redirect("/payType" + (req.body.payTypeId ? "?payTypeId=" + req.body.payTypeId : ""));
                else res.redirect("/managementMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/payTypeDel", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }

        payType.delById(req.db, { payTypeId: req.query.payTypeId }, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? "del-payType" : ret.msg + "-payType";
                req.session.pstatusvar = ret.payTypeNb ? ret.payTypeNb : 0;
                res.redirect("/managementMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/payCond", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config payCond page (payCond Form)

        // error from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }
        req.param.Obj = {};
        payCond.findById(req.db, { payCondId: req.query.payCondId }, function(err, payCondObj) {
            if (err) next(err);
            else {
                req.param.Obj = payCondObj;
                if (req.session.oldObj) {
                    lodash.assign(req.param.Obj, req.session.oldObj);
                    delete req.session.oldObj;
                }
                //console.log("payCond = " + util.inspect(req.param.Obj, false, null));
                req.param.loc = "options";
                res.render("payCond", {srv:  req.param} );
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).post("/payCondUpdate", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit config payCond (process)
        payCond.insertUpdate(req.db, req.body, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? (req.body.payCondId ? "upd-payCond" : "new-payCond") : ret.msg;
                if (ret.msg !== "ok") req.session.oldObj = req.body;
                if (ret.msg === "nok") res.redirect("/payCond" + (req.body.payCondId ? "?payCondId=" + req.body.payCondId : ""));
                else res.redirect("/managementMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/payCondDel", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }

        payCond.delById(req.db, { payCondId: req.query.payCondId }, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? "del-payCond" : ret.msg + "-payCond";
                req.session.pstatusvar = ret.payCondNb ? ret.payCondNb : 0;
                res.redirect("/managementMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/groupProduct", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // config groupProduct page (groupProduct Form)

        // error from FROM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }
        req.param.tvaList = [];
        req.param.Obj = {};
        groupProduct.findById(req.db, { groupProductId: req.query.groupProductId }, function(err, groupProductObj) {
            if (err) next(err);
            else {
                req.param.Obj = groupProduct.getFlatVersion(groupProductObj);
                if (req.session.oldObj) {
                    req.param.Obj = req.session.oldObj;
                    delete req.session.oldObj;
                }
                //console.log("groupProduct = " + util.inspect(req.param.Obj, false, null));
                // get all TVA for Select box
                tva.findAll(req.db, function (err, TVAList) {
                    if (err) next(err);
                    else {
                        if (TVAList) req.param.TVAList = TVAList;
                        if (req.session.oldObj) {
                            lodash.assign(req.param.Obj, req.session.oldObj);
                            delete req.session.oldObj;
                        }
                        req.param.loc = "options";
                        res.render("groupProduct", {srv:  req.param} );
                    }
                }); // tva all
            }
        }); // find group product
        // ---------------------------------------------------------------------------------------------
    }).post("/groupProductUpdate", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // submit config groupProduct (process)

        // manage file
        if (req.files && req.files.groupProductIconFile) {
            upload(req.files.groupProductIconFile, maxForIcon[1], maxForIcon[0], function(st, path) {
                if (st === "rej" || st === "nok" || st === "nof") {
                    req.session.pstatus = st;
                    if (req.files.groupProductIconFile)  fs.unlink(req.files.groupProductIconFile.path);
                    req.session.oldObj = req.body;
                    req.session.oldObj.groupProductIcon = req.body.groupProductIcon;
                    res.redirect("/groupProduct" + (req.body.groupProductId ? "?groupProductId=" + req.body.groupProductId : ""));
                } else if (st === "ok") {
                    if (path) req.body.groupProductIcon = path;
                    groupProduct.insertUpdate(req.db, req.body, function(err, ret) {
                        if (err) next(err);
                        else {
                            req.session.pstatus = ret.msg === "ok" ? (req.body.groupProductId ? "upd-groupProduct" : "new-groupProduct") : ret.msg;
                            if (ret.msg !== "ok") {
                                req.session.oldObj = req.body;
                                req.session.oldObj.groupProductIcon = req.body.groupProductIcon;
                            }
                            if (ret.msg === "nok") res.redirect("/groupProduct" + (req.body.groupProductId ? "?groupProductId=" + req.body.groupProductId : ""));
                            else res.redirect("/managementMenu");
                        }
                    }); // insert update groupProduct
                }
            }); // upload icon
        } else {
            //console.log("NO file ");
            groupProduct.insertUpdate(req.db, req.body, function(err, ret) {
                if (err) next(err);
                else {
                    req.session.pstatus = ret.msg === "ok" ? (req.body.groupProductId ? "upd-groupProduct" : "new-groupProduct") : ret.msg;
                    if (ret.msg !== "ok") {
                        req.session.oldObj = req.body;
                        req.session.oldObj.groupProductIcon = req.body.groupProductIcon;
                    }
                    if (ret.msg === "nok") res.redirect("/groupProduct" + (req.body.groupProductId ? "?groupProductId=" + req.body.groupProductId : ""));
                    else res.redirect("/managementMenu");
                }
            }); // insert update groupProduct
        }
        // ---------------------------------------------------------------------------------------------
    }).get("/groupProductDel", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // error from FORM (post)
        if (req.session.pstatus && req.session.pstatus !== "") {
            req.param.pstatus = req.session.pstatus;
            req.param.pstatusvar = req.session.pstatusvar;
            delete req.session.pstatus;
            delete req.session.pstatusvar;
        }

        groupProduct.delById(req.db, { groupProductId: req.query.groupProductId }, function(err, ret) {
            if (err) next(err);
            else {
                req.session.pstatus = ret.msg === "ok" ? "del-groupProduct" : ret.msg + "-groupProduct";
                req.session.pstatusvar = ret.groupProductNb ? ret.groupProductNb : 0;
                res.redirect("/managementMenu");
            }
        });
        // ---------------------------------------------------------------------------------------------
    });
};

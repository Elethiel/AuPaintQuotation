var admin = require("../model/adminObj");

module.exports = function(app) {
    app.get("/login", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // login page (login form)
        if(req.param.session.username)  {
            req.param.loc = "home";
            res.render("welcome", {srv:  req.param});
        }
        else res.render("login", {srv:  req.param});
        // ---------------------------------------------------------------------------------------------
    }).post("/in", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // SUBMIT login (process)
        admin.logUser(req.db, [req.body.inputLogin, req.body.inputPass], function(err, row) {
            if (err) next(err);
            else {
                if (row && row.msg === "nok") {
                    req.param.pstatus = "nok";
                    res.render("login", {srv:  req.param});
                }
                else {
                    //console.log("==> Login with "+row.username);
                    req.session.username = row.username;
                    res.redirect("/");
                }
            }
        });
        // ---------------------------------------------------------------------------------------------
    }).get("/logout", function(req, res, next) {
        // ---------------------------------------------------------------------------------------------
        // logout
        if(req.session) delete req.session.username;
        res.redirect("/");
        // ---------------------------------------------------------------------------------------------
    });
};
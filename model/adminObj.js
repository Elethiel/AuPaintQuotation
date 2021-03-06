var Admin = function() {};

// db.run("CREATE TABLE admin (name TEXT, login TEXT, pass TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'admin'); } });

Admin.prototype.logUser = function(db, param, callback) {
    // request to find is owner already exist
    db.get("SELECT name FROM admin WHERE login = ? AND pass = ?", param, function(err, row) {
        if (err) callback(err);
        else {
            if (row)    callback(null, {msg:"ok", username: row.name});
            else        callback(null, {msg:"nok", username: ""});
        }
    });
};

module.exports = new Admin();

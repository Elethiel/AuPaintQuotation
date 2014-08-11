var Admin = function() {};

// db.run("CREATE TABLE admin (name TEXT, login TEXT, pass TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'admin'); } });

Admin.prototype.logUser = function(db, param, callback) {
    // request to find is owner already exist
    console.log("logUser with : " + param);
    db.get("SELECT name FROM admin WHERE login = ? AND pass = ?", param, function(err, row) {
        if(err) {
            console.log('erreur SQL logUser');
            throw err;
        }
        else {
            if (row)    {
                console.log('logUser : TRUE ' + row.name);
                callback({msg:"ok", username: row.name});
            }
            else {
                console.log('logUser : FALSE ');
                callback({msg:"nok", username: ""});
            }
        }
    });
};

module.exports = new Admin();

var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var async = require("async");

var db = function() {
    /// database connexion
    this.file = "./data/aupaint.db";
    this.exists = fs.existsSync(this.file);
    this.db = null;
};

/// TECHNICAL REQUEST
db.prototype.init = function() {
    // create file if needed
    if (!this.exists) {
        console.log("Creating db file.");
        fs.openSync(this.file, "w");
    }
    // init db
    this.db = new sqlite3.Database(this.file);

    var db = this.db;

    // initialize table if needed
    if (!this.exists) {
        async.series( [
                function(callback) {
                        console.log("Creating TABLE admin.");
                        db.run("CREATE TABLE admin (name TEXT, login TEXT, pass TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'admin'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE tva.");
                        db.run("CREATE TABLE tva (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, percent REAL NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'tva'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE payType.");
                        db.run("CREATE TABLE payType (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'payType'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE payCondition.");
                        db.run("CREATE TABLE payCondition (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'payCondition'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE address.");
                        db.run("CREATE TABLE address (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, line1 TEXT, line2 TEXT, cp TEXT, city TEXT, country TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'address'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE contact.");
                        db.run("CREATE TABLE contact (id INTEGER PRIMARY KEY AUTOINCREMENT, tel TEXT, fax TEXT, mobile TEXT, mail TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'contact'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE company.");
                        db.run("CREATE TABLE company (id INTEGER PRIMARY KEY AUTOINCREMENT, legal TEXT, name TEXT, tva TEXT, siret TEXT, ape TEXT, address_id INT NOT NULL, contact_id INT NOT NULL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'company'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE person.");
                        db.run("CREATE TABLE person (id INTEGER PRIMARY KEY AUTOINCREMENT, gender char(2), firstname TEXT, lastname TEXT, address_id INT NOT NULL, contact_id INT NOT NULL, note TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'person'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE customer.");
                        db.run("CREATE TABLE customer (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT, type BOOLEAN, company_id INT, person_id INT, note TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'customer'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE customer_person.");
                        db.run("CREATE TABLE customer_person (customer_id INT, person_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'customer_person'); } });
                    },
                function(callback) {
                        console.log("Creating INDEX ON customer_person.");
                        db.run("CREATE INDEX IX_customerPerson ON customer_person (customer_id)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'index on customer_person'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE groupProduct.");
                        db.run("CREATE TABLE groupProduct (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT, icon TEXT, tva_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'group'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE product.");
                        db.run("CREATE TABLE product (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INT, label TEXT, code TEXT, ttc REAL, unit TEXT, paid REAL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'product'); } });
                    },
                function(callback) {
                        console.log("Creating INDEX ON product.");
                        db.run("CREATE INDEX IX_product ON product (group_id)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'index on product'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE payment.");
                        db.run("CREATE TABLE payment (id INTEGER PRIMARY KEY AUTOINCREMENT, payType_id INT, amount REAL, datePaid DATE, statusPaid TEXT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'payment'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE presta.");
                        db.run("CREATE TABLE presta (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INT, quantity INT, discount REAL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'presta'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE invoice.");
                        db.run("CREATE TABLE invoice (id INTEGER PRIMARY KEY AUTOINCREMENT, type BOOLEAN, customer_id INT, ref TEXT, version INT, creationDt DATE, updateDt DATE, endValidityDt DATE, invoiceStatus TEXT,  globalDiscount REAL, deposite REAL, internalNote TEXT, customerNote TEXT, payCond_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'invoice'); } });
                    },
                function(callback) {
                        console.log("Creating INDEX ON invoice.");
                        db.run("CREATE INDEX IX_invoice ON invoice (invoiceStatus, customer_id, payCond_id, ref, endValidityDt)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'index on invoice'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE invoice_presta.");
                        db.run("CREATE TABLE invoice_presta (invoice_id INT, presta_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'invoice_presta'); } });
                    },
                function(callback) {
                        console.log("Creating INDEX ON invoice_presta.");
                        db.run("CREATE INDEX IX_invoicePresta ON invoice_presta (invoice_id, presta_id)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'index on invoice_presta'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE invoice_payment.");
                        db.run("CREATE TABLE invoice_payment (invoice_id INT, payment_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'invoice_payment'); } });
                    },
                function(callback) {
                        console.log("Creating INDEX ON invoice_payment.");
                        db.run("CREATE INDEX IX_invoicePayment ON invoice_payment (invoice_id, payment_id)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'index on invoice_payment'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE invoice_payType.");
                        db.run("CREATE TABLE invoice_payType (invoice_id INT, payType_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'invoice_payType'); } });
                    },
                function(callback) {
                        console.log("Creating INDEX ON invoice_payType.");
                        db.run("CREATE INDEX IX_invoicePayType ON invoice_payType (invoice_id, payType_id)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'index on invoice_payType'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE owner.");
                        db.run("CREATE TABLE owner (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INT, fiscalDt INT, defaultValidity INT, logo TEXT, bigLogo TEXT, factorok REAL, factornull REAL)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'owner'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE owner_invoice.");
                        db.run("CREATE TABLE owner_invoice (owner_id INT, invoice_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'owner_invoice'); } });
                    },
                function(callback) {
                        console.log("Creating INDEX ON owner_invoice.");
                        db.run("CREATE INDEX IX_ownerInvoice ON owner_invoice (owner_id, invoice_id)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'index on owner_invoice'); } });
                    },
                function(callback) {
                        console.log("Creating TABLE owner_customer.");
                        db.run("CREATE TABLE owner_customer (owner_id INT, customer_id INT)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'owner_customer'); } });
                    },
                function(callback) {
                        console.log("Creating INDEX ON owner_customer.");
                        db.run("CREATE INDEX IX_ownerCustomer ON owner_customer (owner_id, customer_id)", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'index on owner_customer'); } });
                    },
                function(callback) {
                        console.log("Fill tables.");
                        db.run("INSERT INTO admin (name, login, pass) VALUES ('Mr Admin', 'admin', 'admin')", function(err) { if (err) return callback(err, ''); });
                        db.run("INSERT INTO tva (label, percent) VALUES ('TVA 10%', 10.00)", function(err) { if (err) return callback(err, ''); } );
                        db.run("INSERT INTO tva (label, percent) VALUES ('TVA 20%', 20.00)", function(err) { if (err) return callback(err, ''); });
                        db.run("INSERT INTO payType (label) VALUES ('CB')", function(err) { if (err) return callback(err, ''); } );
                        db.run("INSERT INTO payType (label) VALUES ('Chèque')", function(err) { if (err) return callback(err, ''); } );
                        db.run("INSERT INTO payType (label) VALUES ('Liquide')", function(err) { if (err) return callback(err, ''); } );
                        db.run("INSERT INTO payCondition (label) VALUES ('20% d''acompte à la commande, le solde à réception de facture')", function(err) { if (err) return callback(err, ''); } );
                        db.run("INSERT INTO payCondition (label) VALUES ('Paiement en fin de mois')", function(err) { if (err) callback(err, ''); else { console.log('==> done'); callback(err, 'filled'); } });
                    }
            ] ,
            function(err, res) {
                if (err) {
                    console.log(err);
                    return err;
                }
            }
        );
    }
};

db.prototype.close = function() {
    this.db.close();
};

db.prototype.prepare = function(sql) {
    return this.db.prepare(sql);
};

db.prototype.run = function(sql, params, callback) {
    return this.db.run(sql, params, callback);
};

db.prototype.each = function(sql, params, callback) {
    return this.db.each(sql, params, callback);
};


db.prototype.each = function(sql, params, callback, complete) {
    return this.db.each(sql, params, callback, complete);
};

db.prototype.get = function(sql, params, callback) {
    return this.db.get(sql, params, callback);
};

db.prototype.all = function(sql, params, callback) {
    return this.db.all(sql, params, callback);
};
db.prototype.updateAdmin = function(username, callback) {
    this.db.run("UPDATE admin SET name = ? WHERE login = 'admin'", [username], callback);
};

module.exports = new db();
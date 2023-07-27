const sqlite3 = require('sqlite3');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

mkdirp.sync(path.join(__dirname, 'var', 'db'));

const db = new sqlite3.Database(path.join(__dirname, 'var', 'db', 'accounts.db'));

db.serialize(function () {
    // create the database schema for the todos app
    db.run("CREATE TABLE IF NOT EXISTS users ( \
        id INTEGER PRIMARY KEY, \
        username TEXT UNIQUE, \
        hashed_password BLOB, \
        salt BLOB \
    )");

    db.run("CREATE TABLE IF NOT EXISTS todos ( \
        id INTEGER PRIMARY KEY, \
        owner_id INTEGER NOT NULL, \
        title TEXT NOT NULL, \
        completed INTEGER \
    )");

    const accounts_path = path.join(__dirname, 'auth', 'accounts.json');

    fs.readFile(accounts_path, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            process.exit(1);
        }
        try {
            const users = JSON.parse(jsonString);
            users.forEach(user => {
                let salt = crypto.randomBytes(16);
                db.run('INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
                    user.name,
                    crypto.pbkdf2Sync(user.password, salt, 310000, 32, 'sha256'),
                    salt
                ], (err) => {
                    if (err) {
                        console.log('Database insert error:', err);
                        process.exit(1);
                    }
                });
            });
        } catch(err) {
            console.log('Error parsing JSON string:', err);
            process.exit(1);
        }
    });

});

module.exports = db;

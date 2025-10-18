const sqlite3 = require('sqlite3').verbose();  

const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        console.error('Could not open database', err);
    } else {
        console.log('Connected to the SQLite database');
    }
});


const createTable = () => {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
            uuid TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            verification_code TEXT NOT NULL,
            email TEXT NOT NULL,
            verified BOOLEAN NOT NULL DEFAULT 0,
            password TEXT NOT NULL
        );
    `;
    
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Table "users" is ready or already exists.');
        }
    });
};

createTable();

module.exports = db;

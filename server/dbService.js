const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('db is ' + connection.state);
});

// ORGANIZATIONS
function createOrganization(data, callback) {
    const sql = `
    INSERT INTO organizations (org_id, org_name, org_address, institution_type, date_added)
    VALUES (?, ?, ?, ?, ?)
  `;
    connection.query(
        sql,
        [data.org_id, data.org_name, data.org_address, data.institution_type, data.date_added],
        callback
    );
}

// CANVASSERS
function createCanvasser(data, callback) {
    const query = `
        INSERT INTO canvassers
        (canvasser_id, organization_id, username, password,
         canvasser_name, email, contact_number, department, position, date_added)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(
        query,
        [
            data.canvasser_id,
            data.organization_id,
            data.username,
            data.password,
            data.canvasser_name,
            data.email,
            data.contact_number,
            data.department,
            data.position, 
            data.date_added
        ],
        callback
    );
}

// REQUESTS
function createRequest(data, callback) {
    const sql = `
    INSERT INTO requests
    (rfq_id, canvasser_id, rfq_date, rfq_attachment, quotation_status)
    VALUES (?, ?, ?, ?, ?)
  `;
    connection.query(
        sql,
        [
            data.rfq_id,
            data.canvasser_id,
            data.rfq_date,
            data.rfq_attachment,
            data.quotation_status
        ],
        callback
    );
}


function generateYearlyID(prefix, table, column, callback) {
    const year = new Date().getFullYear();
    const datePrefix = `${prefix}${year}-`;

    const query = `SELECT ${column} FROM ${table} WHERE ${column} LIKE ? ORDER BY ${column} DESC LIMIT 1`;

    connection.query(query, [`${datePrefix}%`], (err, results) => {
        if (err) return callback(err, null);

        let nextNum = 1;
        if (results.length > 0) {
            const lastID = results[0][column];
            const lastNum = parseInt(lastID.split('-')[1], 10);
            nextNum = lastNum + 1;
        }

        const id = `${datePrefix}${String(nextNum).padStart(4, '0')}`;
        callback(null, id);
    });
}

module.exports = {
    connection,
    createOrganization,
    createCanvasser,
    createRequest,
    generateYearlyID
};
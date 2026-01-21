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

function searchOrganizations(searchTerm, callback) {
    const sql = `
        SELECT 
            org_id,
            org_name,
            org_address,
            institution_type
        FROM organizations
        WHERE org_name LIKE ?
        ORDER BY org_name ASC
        LIMIT 10
    `;
    connection.query(sql, [`%${searchTerm}%`], callback);
}

function findSimilarRFQ(data, callback) {
    const sql = `
        SELECT 
            r.rfq_id,
            r.rfq_date,
            c.canvasser_id,
            c.canvasser_name,
            c.email,
            c.contact_number,
            c.department,
            c.position,
            c.date_added,
            o.org_id,
            o.org_name,
            o.org_address,
            o.institution_type
        FROM requests r
        JOIN canvassers c ON r.canvasser_id = c.canvasser_id
        JOIN organizations o ON c.organization_id = o.org_id
        WHERE
            o.org_name = ?
            AND c.canvasser_name = ?
        ORDER BY r.rfq_date DESC
        LIMIT 1
    `;

    connection.query(
        sql,
        [data.organization_name, data.name],
        callback
    );
}

function getCanvasserIDByRFQ(rfq_id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT canvasser_id
            FROM requests
            WHERE rfq_id = ?
            LIMIT 1
        `;
        connection.query(sql, [rfq_id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error('RFQ not found'));
            resolve(results[0].canvasser_id);
        });
    });
}

function appendRequestAttachments(rfq_id, newAttachments, callback) {
    const sql = `
        UPDATE requests
        SET rfq_attachment = JSON_MERGE_PATCH(
            IFNULL(rfq_attachment, '{}'),
            ?
        )
        WHERE rfq_id = ?
    `;
    connection.query(sql, [JSON.stringify(newAttachments), rfq_id], callback);
}


function updateCanvasserByRFQ(rfq_id, data, callback) {
    const sql = `
        UPDATE canvassers c
        JOIN requests r ON r.canvasser_id = c.canvasser_id
        SET
            c.canvasser_name = ?,
            c.email = ?,
            c.contact_number = ?,
            c.department = ?,
            c.position = ?
        WHERE r.rfq_id = ?
    `;
    connection.query(
        sql,
        [
            data.canvasser_name,
            data.email,
            data.contact_number,
            data.department,
            data.position,
            rfq_id
        ],
        callback
    );
}

module.exports = {
    connection,
    createOrganization,
    createCanvasser,
    createRequest,
    generateYearlyID,
    searchOrganizations,
    findSimilarRFQ,
    appendRequestAttachments,
    updateCanvasserByRFQ,
    getCanvasserIDByRFQ
};
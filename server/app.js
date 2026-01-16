const express = require('express');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dbService = require('./dbService');
const { raw } = require('mysql');
dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

app.post('/submit-rfq', upload.array('rfq_attachments'), async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      department,
      position,
      institution,
      organization_name,
      organization_address
    } = req.body;

    // Generate incrementing IDs with year using dbService
    const canvasserID = await new Promise((resolve, reject) =>
      dbService.generateYearlyID('CANV', 'canvassers', 'canvasser_id', (err, id) => err ? reject(err) : resolve(id))
    );
    const orgID = await new Promise((resolve, reject) =>
      dbService.generateYearlyID('ORG', 'organizations', 'org_id', (err, id) => err ? reject(err) : resolve(id))
    );
    const rfqID = await new Promise((resolve, reject) =>
      dbService.generateYearlyID('RFQ', 'requests', 'rfq_id', (err, id) => err ? reject(err) : resolve(id))
    );

    const year = new Date().getFullYear();
    const randomusername = Math.random().toString(36).slice(2, 6);
    const username = `acc_${year}${randomusername}`;
    const rawPassword = Math.random().toString(36).slice(-8);

    console.log(rawPassword);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Save attachments
    const attachmentDir = path.join(__dirname, 'uploads', canvasserID, 'requests', 'rfq_attachment');
    fs.mkdirSync(attachmentDir, { recursive: true });

    const attachments = {};
    (req.files || []).forEach((file, i) => {
      const timestamp = new Date()
        .toISOString()
        .replace(/\D/g, '')
        .slice(0, 14); // YYYYMMDDHHMMSS

      const safeOriginalName = file.originalname.replace(/\s+/g, '_');

      const filename = `${timestamp}-${safeOriginalName}`;

      fs.writeFileSync(
        path.join(attachmentDir, filename),
        file.buffer
      );

      attachments[`attachment${i + 1}`] =
        `uploads/${canvasserID}/requests/rfq_attachment/${filename}`;
    });

    // Insert Organization
    await new Promise((resolve, reject) => {
      dbService.createOrganization({
        org_id: orgID,
        org_name: organization_name,
        org_address: organization_address,
        institution_type: institution,
        date_added: new Date()
      }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Insert Canvasser
    await new Promise((resolve, reject) => {
      dbService.createCanvasser({
        canvasser_id: canvasserID,
        organization_id: orgID,
        username,
        password: hashedPassword,
        canvasser_name: name,
        email,
        contact_number: contact,
        department,
        position,
        date_added: new Date()
      }, (err) => err ? reject(err) : resolve());
    });

    // Insert Request
    await new Promise((resolve, reject) => {
      dbService.createRequest({
        rfq_id: rfqID,
        canvasser_id: canvasserID,
        rfq_date: new Date(),
        rfq_attachment: JSON.stringify(attachments),
        quotation_status: 'Pending'
      }, (err) => err ? reject(err) : resolve());
    });

    // Success response
    res.json({
      success: true,
      canvasserID,
      orgID,
      rfqID,
      credentials: { username, password: rawPassword }
    });

  } catch (err) {
    console.error('❌ /submit-rfq error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/template', (req, res) => {
  res.redirect('/home');
});

app.get('/:moduleName', (req, res) => {
  const { moduleName } = req.params;
  if (moduleName === 'index' || moduleName === 'login') {
    return res.redirect('/' + moduleName);
  }
  res.sendFile(path.join(__dirname, '../public/template.html'));
});

app.get('/', (req, res) => {
  res.redirect('/index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});



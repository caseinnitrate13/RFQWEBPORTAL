const express = require('express');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dbService = require('./dbService');
dotenv.config();

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/submit-rfq', upload.array('rfq_attachments'), async (req, res) => {
  try {
    const {
      conflict_action,
      existing_rfq_id,
      name,
      email,
      contact,
      department,
      position,
      institution,
      organization_name,
      organization_address,
      organization_id
    } = req.body;

    if (conflict_action === 'ALL_SAME_LINK') {
      const canvasserID = await dbService.getCanvasserIDByRFQ(existing_rfq_id);

      const attachmentDir = path.join(
        __dirname,
        'uploads',
        canvasserID,
        'requests',
        'rfq_attachment',
        existing_rfq_id
      );
      fs.mkdirSync(attachmentDir, { recursive: true });

      const newAttachments = {};
      (req.files || []).forEach((file, i) => {
        const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        fs.writeFileSync(path.join(attachmentDir, filename), file.buffer);

        newAttachments[`attachment_${Date.now()}_${i}`] =
          `uploads/${canvasserID}/requests/rfq_attachment/${existing_rfq_id}/${filename}`;
      });

      await new Promise((resolve, reject) => {
        dbService.appendRequestAttachments(existing_rfq_id, newAttachments, (err) => {
          err ? reject(err) : resolve();
        });
      });

      return res.json({ success: true, mode: conflict_action });
    }

    if (conflict_action === 'ALL_SAME_NEW') {
      const existingCanvasserID = await dbService.getCanvasserIDByRFQ(existing_rfq_id);

      const rfqID = await new Promise((resolve, reject) =>
        dbService.generateYearlyID('RFQ', 'requests', 'rfq_id', (err, id) => err ? reject(err) : resolve(id))
      );

      const attachmentDir = path.join(
        __dirname, 'uploads', existingCanvasserID, 'requests', 'rfq_attachment', rfqID);
      fs.mkdirSync(attachmentDir, { recursive: true });

      const attachments = {};
      (req.files || []).forEach((file, i) => {
        const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        const safeName = file.originalname.replace(/\s+/g, '_');
        const filename = `${timestamp}-${safeName}`;
        fs.writeFileSync(path.join(attachmentDir, filename), file.buffer);
        attachments[`attachment${i + 1}`] =
          `uploads/${existingCanvasserID}/requests/rfq_attachment/${rfqID}/${filename}`;
      });

      await new Promise((resolve, reject) => {
        dbService.createRequest({
          rfq_id: rfqID,
          canvasser_id: existingCanvasserID,
          rfq_date: new Date(),
          rfq_attachment: JSON.stringify(attachments),
          quotation_status: 'Pending'
        }, (err) => err ? reject(err) : resolve());
      });

      return res.json({ success: true, mode: 'ALL_SAME_NEW', rfqID });
    }

    if (conflict_action === 'PARTIAL_UPDATE') {
      const canvasserID = await dbService.getCanvasserIDByRFQ(existing_rfq_id);

      await new Promise((resolve, reject) => {
        dbService.updateCanvasserByRFQ(existing_rfq_id, {
          canvasser_name: name,
          email,
          contact_number: contact,
          department,
          position
        }, err => err ? reject(err) : resolve());
      });

      const newRFQID = await new Promise((resolve, reject) =>
        dbService.generateYearlyID(
          'RFQ',
          'requests',
          'rfq_id',
          (err, id) => err ? reject(err) : resolve(id)
        )
      );

      const attachmentDir = path.join(
        __dirname,
        'uploads',
        canvasserID,
        'requests',
        'rfq_attachment',
        newRFQID
      );
      fs.mkdirSync(attachmentDir, { recursive: true });

      const attachments = {};
      (req.files || []).forEach((file, i) => {
        const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        const safeName = file.originalname.replace(/\s+/g, '_');
        const filename = `${timestamp}-${safeName}`;

        fs.writeFileSync(path.join(attachmentDir, filename), file.buffer);

        attachments[`attachment${i + 1}`] =
          `uploads/${canvasserID}/requests/rfq_attachment/${newRFQID}/${filename}`;
      });

      await new Promise((resolve, reject) => {
        dbService.createRequest({
          rfq_id: newRFQID,
          canvasser_id: canvasserID,
          rfq_date: new Date(),
          rfq_attachment: JSON.stringify(attachments),
          quotation_status: 'Pending'
        }, err => err ? reject(err) : resolve());
      });

      return res.json({ success: true, mode: 'PARTIAL_UPDATE', rfqID: newRFQID});
    }


    if (conflict_action === 'PARTIAL_NEW') {
    }

    const canvasserID = await new Promise((resolve, reject) =>
      dbService.generateYearlyID('CANV', 'canvassers', 'canvasser_id', (err, id) => err ? reject(err) : resolve(id))
    );

    let orgID = organization_id;
    if (!orgID) {
      orgID = await new Promise((resolve, reject) =>
        dbService.generateYearlyID('ORG', 'organizations', 'org_id', (err, id) => err ? reject(err) : resolve(id))
      );

      await new Promise((resolve, reject) => {
        dbService.createOrganization({
          org_id: orgID,
          org_name: organization_name,
          org_address: organization_address,
          institution_type: institution,
          date_added: new Date()
        }, (err) => err ? reject(err) : resolve());
      });
    }

    const rfqID = await new Promise((resolve, reject) =>
      dbService.generateYearlyID('RFQ', 'requests', 'rfq_id', (err, id) => err ? reject(err) : resolve(id))
    );

    const year = new Date().getFullYear();
    const randomusername = Math.random().toString(36).slice(2, 6);
    const username = `acc_${year}${randomusername}`;
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const attachmentDir = path.join(__dirname, 'uploads', canvasserID, 'requests', 'rfq_attachment', rfqID);
    fs.mkdirSync(attachmentDir, { recursive: true });

    const attachments = {};
    (req.files || []).forEach((file, i) => {
      const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
      const safeOriginalName = file.originalname.replace(/\s+/g, '_');
      const filename = `${timestamp}-${safeOriginalName}`;

      fs.writeFileSync(path.join(attachmentDir, filename), file.buffer);

      attachments[`attachment${i + 1}`] =
        `uploads/${canvasserID}/requests/rfq_attachment/${rfqID}/${filename}`;
    });


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

    await new Promise((resolve, reject) => {
      dbService.createRequest({
        rfq_id: rfqID,
        canvasser_id: canvasserID,
        rfq_date: new Date(),
        rfq_attachment: JSON.stringify(attachments),
        quotation_status: 'Pending'
      }, (err) => err ? reject(err) : resolve());
    });

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

app.post('/check-existing-rfq', async (req, res) => {
  try {
    const form = req.body;

    dbService.findSimilarRFQ(form, (err, result) => {
      if (err) return res.status(500).json({ success: false });

      if (!result.length) {
        return res.json({ success: true, matchType: 'NONE' });
      }

      const existing = result[0];

      const fieldsToCompare = [
        ['canvasser_name', 'name'],
        ['email', 'email'],
        ['contact_number', 'contact'],
        ['department', 'department'],
        ['position', 'position'],
        ['org_address', 'organization_address'],
        ['institution_type', 'institution']
      ];

      const differences = [];

      fieldsToCompare.forEach(([dbField, formField]) => {
        const dbValue = (existing[dbField] || '').toString().trim();
        const formValue = (form[formField] || '').toString().trim();

        if (dbValue !== formValue) {
          differences.push(formField);
        }
      });

      const matchType =
        differences.length === 0
          ? 'ALL_SAME'
          : 'PARTIAL';

      res.json({
        success: true,
        matchType,
        rfq_id: existing.rfq_id,
        existingRFQ: existing,
        differences
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get('/search-organizations', async (req, res) => {
  const query = req.query.q || '';
  try {
    const organizations = await new Promise((resolve, reject) => {
      dbService.searchOrganizations(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.json({ success: true, organizations });
  } catch (err) {
    console.error('❌ /search-organizations error:', err);
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



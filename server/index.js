const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

dotenv.config();
mongoose.set('bufferCommands', false);

// ─── Startup: validate required environment variables ───────────────────────
const REQUIRED_ENV = ['MONGODB_URI'];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
}

if (!process.env.APPS_SCRIPT_URL) {
  console.warn('⚠️  APPS_SCRIPT_URL is not set. Apps Script sync will be skipped.');
}

const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// ─── MongoDB Connection Helper ──────────────────────────────────────────────
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  console.log('🔄 Connecting to MongoDB...');
  cachedDb = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
  });
  console.log('✅ Connected to MongoDB Atlas');
  return cachedDb;
}

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  // Skip DB check for health route
  if (req.path === '/api/health') return next();
  
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Ensure 0.0.0.0/0 is added to MongoDB Atlas Network Access.',
      error: err.message
    });
  }
});

const isDatabaseConnected = () => mongoose.connection.readyState === 1;
const PAYMENT_PER_HEAD = Number(process.env.PAYMENT_PER_HEAD) > 0 ? Number(process.env.PAYMENT_PER_HEAD) : 100;

const sanitizeText = (value) => String(value || '').trim();
const normalizeEmail = (value) => sanitizeText(value).toLowerCase();
const normalizeTeamMembers = (members) =>
  Array.isArray(members) ? members.map((m) => sanitizeText(m)).filter(Boolean) : [];
const TECHNICAL_EVENTS = ['Concept Expo', 'Proto Fest', 'Code Rush', 'App Architects', 'Brain Rush'];
const NON_TECHNICAL_EVENTS = [
  'E-sports',
  'Sonic Nexus',
  'CID',
  'Auction Battle',
  'Crown Mate',
];
const EVENT_NAME_ALIASES = new Map([
  ['CID (Criminal Investigation Department)', 'CID'],
  ['Champian Pics', 'Auction Battle'],
  ['Champion Pics', 'Auction Battle'],
]);
const EVENT_CATEGORY_BY_NAME = new Map([
  ...TECHNICAL_EVENTS.map((eventName) => [eventName, 'Technical']),
  ...NON_TECHNICAL_EVENTS.map((eventName) => [eventName, 'Non-Technical']),
  ['CID (Criminal Investigation Department)', 'Non-Technical'],
  ['Champian Pics', 'Non-Technical'],
  ['Champion Pics', 'Non-Technical'],
]);
const normalizeCategory = (value) => {
  const raw = sanitizeText(value).toLowerCase();
  if (raw === 'technical') return 'Technical';
  if (raw === 'non-technical' || raw === 'non technical' || raw === 'nontechnical' || raw === 'non-tech') {
    return 'Non-Technical';
  }
  return '';
};
const normalizeSelectedEvents = (selectedEvents, fallbackCategory, fallbackEvent) => {
  const source =
    Array.isArray(selectedEvents) && selectedEvents.length > 0
      ? selectedEvents
      : [{ category: fallbackCategory, event: fallbackEvent }];
  const normalized = [];
  const seen = new Set();

  for (const item of source) {
    const eventName = sanitizeText(
      typeof item === 'string' ? item : item?.event || item?.eventName || item?.name
    );
    if (!eventName) continue;
    const canonicalEventName = EVENT_NAME_ALIASES.get(eventName) || eventName;

    const key = canonicalEventName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const categoryFromName = EVENT_CATEGORY_BY_NAME.get(canonicalEventName) || '';
    const categoryFallback =
      typeof item === 'object' && item ? normalizeCategory(item.category) : '';
    const category = categoryFromName || categoryFallback || normalizeCategory(fallbackCategory);
    normalized.push({ category, event: canonicalEventName });
  }

  return normalized;
};
const validateSelectedEvents = (selectedEvents) => {
  if (!Array.isArray(selectedEvents) || selectedEvents.length < 1) {
    return 'Select at least 1 event.';
  }
  if (selectedEvents.length > 2) {
    return 'Maximum 2 events are allowed per registration.';
  }

  // if user picked two events, ensure they are not both non-technical
  if (selectedEvents.length === 2) {
    let technicalCount = 0;
    let nonTechnicalCount = 0;

    for (const selection of selectedEvents) {
      const eventName = sanitizeText(selection?.event);
      const categoryFromName = EVENT_CATEGORY_BY_NAME.get(eventName);
      if (!categoryFromName) {
        return `Invalid event selected: ${eventName || 'Unknown'}`;
      }
      if (categoryFromName === 'Technical') technicalCount += 1;
      if (categoryFromName === 'Non-Technical') nonTechnicalCount += 1;
    }

    if (nonTechnicalCount === 2) {
      return 'You cannot select two non-technical events. Please choose at most one non-technical event.';
    }
  }
  return '';
};
const buildPaymentDetails = (members) => {
  const safeMembers = normalizeTeamMembers(members);
  const participantCount = 1 + safeMembers.length;
  return {
    teamMembers: safeMembers,
    participantCount,
    paymentAmount: participantCount * PAYMENT_PER_HEAD,
  };
};
const enrichRegistration = (record) => {
  if (!record) return null;
  const plain = typeof record.toObject === 'function' ? record.toObject() : { ...record };
  
  const details = buildPaymentDetails(plain.teamMembers);
  const selectedEvents = normalizeSelectedEvents(plain.selectedEvents, plain.category, plain.event);
  const primarySelection = selectedEvents[0] || {
    category: normalizeCategory(plain.category),
    event: sanitizeText(plain.event),
  };

  // Safely convert Maps to plain objects
  const safeEntries = (val) => {
    if (val instanceof Map) return Object.fromEntries(val);
    if (val && typeof val === 'object' && !Array.isArray(val)) return val;
    return {};
  };

  return {
    ...plain,
    category: primarySelection.category || sanitizeText(plain.category),
    event: primarySelection.event || sanitizeText(plain.event),
    selectedEvents,
    teamMembers: details.teamMembers,
    participantCount:
      Number.isFinite(Number(plain.participantCount)) && Number(plain.participantCount) > 0
        ? Number(plain.participantCount)
        : details.participantCount,
    paymentAmount:
      Number.isFinite(Number(plain.paymentAmount)) && Number(plain.paymentAmount) >= 0
        ? Number(plain.paymentAmount)
        : details.paymentAmount,
    paymentPerHead: PAYMENT_PER_HEAD,
    individualScores: safeEntries(plain.individualScores),
    eventProgress: safeEntries(plain.eventProgress),
  };
};

const sheetsSyncState = {
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastStatus: 'never',
  lastError: null,
};

// ─── Coordinator Contacts Page ───────────────────────────────────────────────
app.get('/coordinators', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'coordinators.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    dbReady: isDatabaseConnected(),
    dbState: mongoose.connection.readyState,
    appsScriptConfigured: Boolean(process.env.APPS_SCRIPT_URL),
    paymentPerHead: PAYMENT_PER_HEAD,
    sheetsSync: sheetsSyncState,
  });
});

const registrationSchema = new mongoose.Schema({
  fullName:          { type: String, required: true },
  email:             { type: String, unique: true, required: true },
  phone:             String,
  college:           String,
  department:        String,
  year:              String,
  category:          String,
  event:             String,
  selectedEvents:    [{ category: String, event: String }],
  teamMembers:       [String],
  ticketId:          { type: String, unique: true },
  password:          { type: String },
  participantCount:  { type: Number, default: 1 },
  paymentAmount:     { type: Number, default: PAYMENT_PER_HEAD },
  isPaid:            { type: Boolean, default: false },
  attendance:        { type: Boolean, default: false },
  currentRound:      { type: Number, default: 1 },
  scores:            { type: [Number], default: [0, 0, 0] },
  individualScores:  { type: Map, of: [Number], default: {} },
  eventProgress:     { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  isPasswordChanged: { type: Boolean, default: false },
  registrationDate:  { type: Date, default: Date.now },
});

const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

const alertSchema = new mongoose.Schema({
  event:   String,
  message: String,
  triggeredBy: { type: String, default: 'Coordinator' },
  status:  { type: String, default: 'OPEN' },
  date:    { type: Date, default: Date.now },
});

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);

const settingsSchema = new mongoose.Schema({
  key:   { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed
});
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// Helper to get registration status
async function isRegistrationOpen() {
  const s = await Settings.findOne({ key: 'registration_enabled' });
  return s ? !!s.value : true; // Default to true
}

// ─── HELPER: Google Sheets Sync ──────────────────────────────────────────────
async function syncToGoogleSheets(scriptUrl, payload) {
  const body = payload;
  const headers = { 'Content-Type': 'application/json;charset=utf-8' };
  const toBodyText = (data) => (typeof data === 'string' ? data : JSON.stringify(data || {}));
  const hasSuccessMarker = (data) => {
    const text = toBodyText(data);
    return /email sent/i.test(text) || /"success"\s*:\s*true/i.test(text) || /"status"\s*:\s*"(ok|success|email sent)"/i.test(text);
  };

  sheetsSyncState.lastAttemptAt = new Date().toISOString();
  sheetsSyncState.lastStatus = 'attempting';
  sheetsSyncState.lastError = null;

  if (!scriptUrl) {
    sheetsSyncState.lastStatus = 'failed';
    sheetsSyncState.lastError = 'APPS_SCRIPT_URL is empty.';
    return { success: false, status: 0, error: sheetsSyncState.lastError };
  }

  try {
    const followed = await axios.post(scriptUrl, body, {
      headers,
      maxRedirects: 5,
      timeout: 10000,
      validateStatus: () => true,
    });

    // log the raw response to aid debugging when sheet sync behaves unexpectedly
    console.log('[GoogleSheetsSync] response', {
      status: followed.status,
      data: followed.data,
    });

    if (followed.status >= 200 && followed.status < 300) {
      if (hasSuccessMarker(followed.data)) {
        sheetsSyncState.lastStatus = 'success';
        sheetsSyncState.lastSuccessAt = new Date().toISOString();
        return { success: true, status: followed.status, data: followed.data };
      }
      // if we reach here, the web app returned 2xx but didn't contain expected marker
      console.warn('[GoogleSheetsSync] success status without marker', followed.status, followed.data);
      sheetsSyncState.lastStatus = 'failed';
      sheetsSyncState.lastError = 'Response lacked success marker';
      return { success: false, status: followed.status, data: followed.data, error: sheetsSyncState.lastError };
    }

    // non-2xx status codes
    console.warn('[GoogleSheetsSync] non-2xx status', followed.status, followed.data);
    sheetsSyncState.lastStatus = 'failed';
    sheetsSyncState.lastError = `HTTP ${followed.status}`;
    return { success: false, status: followed.status, data: followed.data, error: sheetsSyncState.lastError };
  } catch (err) {
    console.error('[GoogleSheetsSync] error', err.message);
    sheetsSyncState.lastStatus = 'failed';
    sheetsSyncState.lastError = err.message;
    return { success: false, error: err.message };
  }
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// Get registration status
app.get('/api/admin/settings/registration-status', async (req, res) => {
  try {
    const status = await isRegistrationOpen();
    res.json({ success: true, enabled: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle registration status
app.post('/api/admin/settings/toggle-registration', async (req, res) => {
  try {
    const current = await isRegistrationOpen();
    await Settings.findOneAndUpdate(
      { key: 'registration_enabled' },
      { value: !current },
      { upsert: true, new: true }
    );
    res.json({ success: true, enabled: !current });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Submit Registration
app.post('/api/register', async (req, res) => {
  try {
    // CHECK IF REGISTRATION IS OPEN
    if (!(await isRegistrationOpen())) {
      return res.status(403).json({ 
        success: false, 
        message: 'Registrations are currently closed by the administrator.' 
      });
    }

    const { email, fullName, phone, college, department, year } = req.body;
    const safeEmail = normalizeEmail(email);
    const safeFullName = sanitizeText(fullName);
    const safePhone = sanitizeText(phone);
    const safeCollege = sanitizeText(college);
    const safeDepartment = sanitizeText(department);
    const safeYear = sanitizeText(year);
    const safeSelectedEvents = normalizeSelectedEvents(
      req.body.selectedEvents,
      req.body.category,
      req.body.event
    );
    const eventsValidationError = validateSelectedEvents(safeSelectedEvents);
    if (eventsValidationError) {
      return res.status(400).json({ success: false, message: eventsValidationError });
    }
    const primarySelection = safeSelectedEvents[0];
    const safeCategory = primarySelection.category;
    const safeEvent = primarySelection.event;
    const paymentDetails = buildPaymentDetails(req.body.teamMembers);

    if (!safeFullName || !safeEmail || !safePhone || !safeCollege || !safeDepartment) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    const existing = await Registration.findOne({ email: safeEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const catPrefix = safeCategory.substring(0, 1).toUpperCase() || 'T';
    const eventPrefix = safeEvent.substring(0, 2).toUpperCase() || 'EV';
    const count = await Registration.countDocuments({ category: safeCategory });
    const ticketId = `${catPrefix}${eventPrefix}-${(count + 1).toString().padStart(3, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

    const randomPass = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(randomPass, 10);

    const newRegistration = new Registration({
      fullName: safeFullName,
      email: safeEmail,
      phone: safePhone,
      college: safeCollege,
      department: safeDepartment,
      year: safeYear,
      category: safeCategory,
      event: safeEvent,
      selectedEvents: safeSelectedEvents,
      teamMembers: paymentDetails.teamMembers,
      participantCount: paymentDetails.participantCount,
      paymentAmount: paymentDetails.paymentAmount,
      ticketId,
      password: hashedPassword,
    });
    
    // SAVE TO DATABASE
    await newRegistration.save();

    const normalizedRegistrationData = {
      fullName: safeFullName,
      email: safeEmail,
      phone: safePhone,
      college: safeCollege,
      department: safeDepartment,
      year: safeYear,
      category: safeCategory,
      event: safeEvent,
      selectedEvents: safeSelectedEvents,
      teamMembers: paymentDetails.teamMembers,
      participantCount: paymentDetails.participantCount,
      paymentAmount: paymentDetails.paymentAmount,
      ticketId,
      password: randomPass
    };

    let sheetsSyncResult = { attempted: false };
    if (process.env.APPS_SCRIPT_URL) {
      // wait for sync and include result so the frontend can show an error message
      const result = await syncToGoogleSheets(process.env.APPS_SCRIPT_URL, normalizedRegistrationData);
      sheetsSyncResult = { attempted: true, ...result };
    }

    res.status(201).json({
      success: true,
      ticketId,
      password: randomPass,
      participantCount: paymentDetails.participantCount,
      paymentAmount: paymentDetails.paymentAmount,
      paymentPerHead: PAYMENT_PER_HEAD,
      sheetsSync: sheetsSyncResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Participant Login
app.post('/api/participant/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const safeEmail = normalizeEmail(email);
    const p = await Registration.findOne({ email: safeEmail });
    if (!p) return res.status(400).json({ success: false, message: 'User not found.' });

    const isMatch = await bcrypt.compare(password, p.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials.' });

    res.json({ success: true, id: p._id, isPasswordChanged: p.isPasswordChanged });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Admin: Get All Registrations
app.get('/api/admin/registrations', async (req, res) => {
  try {
    const regs = await Registration.find().sort({ registrationDate: -1 });
    res.json(regs.map((reg) => enrichRegistration(reg)));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Admin: Toggle Payment
app.patch('/api/admin/toggle-payment/:id', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    reg.isPaid = !reg.isPaid;
    await reg.save();
    res.json({ success: true, isPaid: reg.isPaid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Admin: Toggle Attendance
app.patch('/api/admin/toggle-attendance/:id', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    reg.attendance = !reg.attendance;
    await reg.save();
    res.json({ success: true, attendance: reg.attendance });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Coordinator: Update Progress
app.patch('/api/coordinator/update-progress/:id', async (req, res) => {
  try {
    const { round, score, promote, memberIndex, eventName } = req.body;
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });

    const targetEvent = sanitizeText(eventName) || reg.event;
    if (!reg.eventProgress) reg.eventProgress = new Map();
    let currentEventData = reg.eventProgress.get(targetEvent) || { round: 1, scores: [0, 0, 0] };

    if (targetEvent === 'Crown Mate' && memberIndex !== undefined && memberIndex !== null) {
      const idx = Number(memberIndex);
      const key = `${targetEvent}_member_${idx}`;
      let memberScores = reg.individualScores.get(key) || [0, 0, 0];
      if (score !== undefined) memberScores[Number(round) - 1] = Number(score);
      reg.individualScores.set(key, memberScores);
      reg.markModified('individualScores');
    } else {
      if (score !== undefined) currentEventData.scores[Number(round) - 1] = Number(score);
      if (promote) currentEventData.round = Math.min(3, currentEventData.round + 1);
      reg.eventProgress.set(targetEvent, currentEventData);
      reg.markModified('eventProgress');
    }

    await reg.save();
    res.json({ success: true, participant: enrichRegistration(reg) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Admin: Get Alerts
app.get('/api/admin/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ date: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Admin: Resolve Emergency Alert
app.patch('/api/admin/alerts/:id/resolve', async (req, res) => {
  try {
    const resolved = await Alert.findByIdAndUpdate(req.params.id, { status: 'RESOLVED' }, { new: true });
    res.json({ success: true, alert: resolved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Admin: Clear Alert History
app.delete('/api/admin/alerts/history', async (req, res) => {
  try {
    await Alert.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Admin: Delete Registration
app.delete('/api/admin/delete-registration/:id', async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10b. Admin: Update Registration Details
app.patch('/api/admin/update-registration/:id', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Participant not found.' });

    if (req.body.fullName !== undefined) reg.fullName = sanitizeText(req.body.fullName);
    if (req.body.email !== undefined) reg.email = normalizeEmail(req.body.email);
    if (req.body.phone !== undefined) reg.phone = sanitizeText(req.body.phone);
    if (req.body.college !== undefined) reg.college = sanitizeText(req.body.college);
    if (req.body.department !== undefined) reg.department = sanitizeText(req.body.department);
    if (req.body.year !== undefined) reg.year = sanitizeText(req.body.year);

    const eventPayloadProvided =
      req.body.selectedEvents !== undefined ||
      req.body.category !== undefined ||
      req.body.event !== undefined;
    if (eventPayloadProvided) {
      const safeSelectedEvents = normalizeSelectedEvents(
        req.body.selectedEvents,
        req.body.category,
        req.body.event
      );
      const eventsValidationError = validateSelectedEvents(safeSelectedEvents);
      if (eventsValidationError) {
        return res.status(400).json({ success: false, message: eventsValidationError });
      }
      const primarySelection = safeSelectedEvents[0];
      reg.selectedEvents = safeSelectedEvents;
      reg.category = primarySelection.category;
      reg.event = primarySelection.event;
    }

    if (req.body.teamMembers !== undefined) {
      const details = buildPaymentDetails(req.body.teamMembers);
      reg.teamMembers = details.teamMembers;
      reg.participantCount = details.participantCount;
      reg.paymentAmount = details.paymentAmount;
    }

    if (req.body.password) {
      reg.password = await bcrypt.hash(req.body.password, 10);
      reg.isPasswordChanged = true;
    }

    await reg.save();
    res.json({ success: true, participant: enrichRegistration(reg) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10c. Admin: Reset Password (Returns new plain text)
// Note: changed to PATCH for consistency with other update actions
const handleResetPassword = async (req, res) => {
  try {
    const newPass = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(newPass, 10);

    const updated = await Registration.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword, isPasswordChanged: false }, // Reset change flag so they have to change it again
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Participant not found.' });

    res.json({ success: true, newPassword: newPass });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.patch('/api/admin/reset-password/:id', handleResetPassword);
// keep POST around for older clients to avoid breaking anything
app.post('/api/admin/reset-password/:id', handleResetPassword);


// 11. Participant: Get Profile
app.get('/api/participant/:id', async (req, res) => {
  try {
    const p = await Registration.findById(req.params.id);
    res.json(enrichRegistration(p));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Participant: Update Profile
app.patch('/api/participant/update-profile/:id', async (req, res) => {
  try {
    const { fullName, teamMembers, phone, college, department, year } = req.body;
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Participant not found.' });

    reg.fullName = sanitizeText(fullName);
    reg.phone = sanitizeText(phone);
    reg.college = sanitizeText(college);
    reg.department = sanitizeText(department);
    reg.year = sanitizeText(year);

    if (!reg.isPaid) {
      const details = buildPaymentDetails(teamMembers);
      reg.teamMembers = details.teamMembers;
      reg.participantCount = details.participantCount;
      reg.paymentAmount = details.paymentAmount;
    }

    await reg.save();
    res.json({ success: true, participant: enrichRegistration(reg) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Participant: Update Password
app.patch('/api/participant/update-password/:id', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    await Registration.findByIdAndUpdate(req.params.id, { password: hashedPassword, isPasswordChanged: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Coordinator: Emergency Alert
app.post('/api/coordinator/emergency', async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── SPA Support & Static Files ──────────────────────────────────────────────
// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Use a regular expression for catch-all to satisfy Express 5 / path-to-regexp
app.get(/^(.*)$/, (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  
  // Check if dist/index.html exists (only in production)
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Fallback message if dist hasn't been built yet
      res.status(200).send('APEC AIML Backend API is running. (Frontend build not found)');
    }
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Export the app for Vercel's serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dj_portfolio';
const JWT_SECRET = process.env.JWT_SECRET || 'dj_portfolio_secret_key_2026';
const ADMIN_DEFAULT_USER = process.env.ADMIN_DEFAULT_USER || 'admin';
const ADMIN_DEFAULT_PASS = process.env.ADMIN_DEFAULT_PASS || 'Dharani@Design2026!';

/* ── DEFAULT 12 PORTFOLIO PROJECTS ── */
const DEFAULT_PROJECTS = [
  { id: 'cr7',     title: 'CR7 — Cristiano Ronaldo', img: 'https://heartydj.github.io/freelancer-portfolio/CR7.jpg', category: 'sports', tags: ['Sports', 'Poster Design'], row: 1, order: 1 },
  { id: 'ferrari', title: 'LaFerrari — Hypercar',     img: 'FERRARI.png',                                            category: 'auto',   tags: ['Auto', 'Hypercar', 'Poster'], row: 1, order: 2 },
  { id: 'lh44',    title: 'LH44 — Lewis Hamilton',   img: 'https://heartydj.github.io/freelancer-portfolio/LH44.jpg',category: 'sports', tags: ['Sports', 'F1', 'Poster'], row: 1, order: 3 },
  { id: 'bmw',     title: 'BMW M4 — Automotive Art',  img: 'https://heartydj.github.io/freelancer-portfolio/BMW%20M4.jpg', category: 'auto', tags: ['Auto', 'Visual Design'], row: 1, order: 4 },
  { id: 'vini',    title: 'Vinicius Jr. — No.7',      img: 'VINI.png',                                               category: 'sports', tags: ['Sports', 'Football', 'Poster'], row: 1, order: 5 },
  { id: 'lambo',   title: 'Lamborghini — Supercar',   img: 'https://heartydj.github.io/freelancer-portfolio/Lamborghini.jpg', category: 'auto', tags: ['Auto', 'Luxury'], row: 1, order: 6 },
  { id: 'gt3',     title: 'Porsche GT3 RS',           img: 'https://heartydj.github.io/freelancer-portfolio/GT3%20RS.jpg', category: 'auto', tags: ['Auto', 'Visual Design'], row: 2, order: 7 },
  { id: 'lm10',    title: 'LM10 — Lionel Messi',     img: 'https://heartydj.github.io/freelancer-portfolio/LM10.jpg',category: 'sports', tags: ['Sports', 'Poster Design'], row: 2, order: 8 },
  { id: 'ford',    title: 'Ford Mustang GT500',        img: 'FORD.png',                                               category: 'auto',   tags: ['Auto', 'Muscle Car', 'Poster'], row: 2, order: 9 },
  { id: 'njr',     title: 'NJR — Neymar Jr',          img: 'https://heartydj.github.io/freelancer-portfolio/NJR.jpg', category: 'sports', tags: ['Sports', 'Poster Design'], row: 2, order: 10 },
  { id: 'srt',     title: 'Dodge SRT — Muscle Car',   img: 'https://heartydj.github.io/freelancer-portfolio/SRT.png', category: 'auto',   tags: ['Auto', 'Visual Design'], row: 2, order: 11 },
  { id: 'ly',      title: 'LY — Lamine Yamal',        img: 'https://heartydj.github.io/freelancer-portfolio/LY.png',  category: 'sports', tags: ['Sports', 'Poster Design'], row: 2, order: 12 },
];

/* ── DEFAULT 4 BRANDING WORKS ── */
const DEFAULT_BRANDINGS = [
  { id: 'uzhavan', title: 'Uzhavan', category: 'Retail · Logo Design', img: 'U.png', behanceUrl: 'https://www.behance.net/gallery/253043531/Uzhavan', order: 1 },
  { id: 'quickpath', title: 'QuickPath', category: 'Tech · Logo Design', img: 'https://heartydj.github.io/freelancer-portfolio/QP.png', behanceUrl: 'https://www.behance.net/gallery/249301889/QuickpathLogo-design', order: 2 },
  { id: 'kriscol', title: 'Kriscol Roofing', category: 'Roofing · Full Identity', img: 'https://heartydj.github.io/freelancer-portfolio/kriscol.png', behanceUrl: 'https://www.behance.net/gallery/246996937/Kriscol', order: 3 },
  { id: 'keshri', title: 'Keshri Academy', category: 'Education · Brand Identity', img: 'https://heartydj.github.io/freelancer-portfolio/keshri.png', behanceUrl: 'https://www.behance.net/gallery/247231533/KESHRI-ACADEMY', order: 4 },
];

/* ── MONGOOSE SCHEMAS & MODELS ── */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  img: { type: String, required: true },
  row: { type: Number, default: 1 },
  externalUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const brandingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  img: { type: String, required: true },
  behanceUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Branding = mongoose.model('Branding', brandingSchema);

/* ── MIDDLEWARES ── */
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

/* ── MONGODB AUTO-CONNECT MIDDLEWARE (SERVERLESS / VERCEL COMPATIBLE) ── */
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && mongoose.connection.readyState !== 1) {
    try {
      await connectToMongo();
    } catch (err) {
      console.warn('[MongoDB] Lazy connection notice:', err.message);
    }
  }
  next();
});

/* ── AUTHENTICATION MIDDLEWARE ── */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

/* ── SEED INITIAL DATABASE DATA ── */
async function seedInitialData() {
  try {
    // 1. Seed initial admin user if no users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_DEFAULT_PASS, salt);
      await User.create({
        username: ADMIN_DEFAULT_USER.toLowerCase(),
        password: hashedPassword
      });
      console.log(`[MongoDB] Initial admin user created: "${ADMIN_DEFAULT_USER}"`);
    }

    // 2. Seed default projects if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany(DEFAULT_PROJECTS);
      console.log(`[MongoDB] Seeded ${DEFAULT_PROJECTS.length} default portfolio projects.`);
    }

    // 3. Seed default branding works if empty
    const brandingCount = await Branding.countDocuments();
    if (brandingCount === 0) {
      await Branding.insertMany(DEFAULT_BRANDINGS);
      console.log(`[MongoDB] Seeded ${DEFAULT_BRANDINGS.length} default branding works.`);
    }
  } catch (err) {
    console.error('[MongoDB] Error during initial database seeding:', err.message);
  }
}

/* ── MONGODB CONNECTION MANAGER ── */
let isConnecting = false;
async function connectToMongo(uri = MONGODB_URI) {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log(`[MongoDB] Connected successfully to: ${uri}`);
    await seedInitialData();
  } catch (err) {
    console.warn(`[MongoDB] Connection notice: Unable to connect to ${uri} (${err.message})`);
  } finally {
    isConnecting = false;
  }
}

/* ── API ROUTES ── */

// 1. Status & Database Health
app.get('/api/status', async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (!isDbConnected && !isConnecting) {
    connectToMongo().catch(() => {});
  }
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    databaseState: mongoose.connection.readyState,
    time: new Date().toISOString()
  });
});

// 2. Authentication: Login (Unlimited attempts as requested)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      await connectToMongo().catch(() => {});
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          error: 'MongoDB is disconnected. Please ensure MongoDB is running or configure MONGODB_URI in your .env file.'
        });
      }
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Session duration: 30 minutes (matches admin dashboard timer)
    const expiresInSeconds = 30 * 60;
    const expiresAt = Date.now() + (expiresInSeconds * 1000);
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: expiresInSeconds }
    );

    res.json({
      success: true,
      token,
      expiresAt,
      user: {
        username: user.username
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// 3. Verify Active Session Token
app.get('/api/auth/verify', requireAuth, async (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// 4. Change Password in MongoDB
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Password updated successfully in MongoDB.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Internal server error while changing password.' });
  }
});

// 5. Get All Projects (Public for portfolio and admin)
app.get('/api/projects', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Fallback to in-memory default if DB offline
      return res.json(DEFAULT_PROJECTS);
    }
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Failed to retrieve projects from database.' });
  }
});

// 6. Create New Project in MongoDB (Protected)
app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const { id, title, category, tags, img, row, externalUrl } = req.body;
    if (!title || !img) {
      return res.status(400).json({ error: 'Title and image are required.' });
    }

    let slug = (id || title).toLowerCase().replace(/[^a-z0-9_\-]+/g, '-');
    const existing = await Project.findOne({ id: slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const count = await Project.countDocuments();
    const newProject = new Project({
      id: slug,
      title: title.trim(),
      category: category ? category.trim() : 'Design',
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : ['Design']),
      img: img.trim(),
      row: row ? parseInt(row, 10) : 1,
      externalUrl: externalUrl ? externalUrl.trim() : '',
      order: count + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to save project to MongoDB.' });
  }
});

// 7. Update Project in MongoDB (Protected)
app.put('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, tags, img, row, externalUrl, order } = req.body;

    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const project = await Project.findOne(query);
    if (!project) {
      return res.status(404).json({ error: `Project with ID '${id}' not found.` });
    }

    if (title) project.title = title.trim();
    if (category) project.category = category.trim();
    if (tags !== undefined) {
      project.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim());
    }
    if (img) project.img = img.trim();
    if (row !== undefined) project.row = parseInt(row, 10);
    if (externalUrl !== undefined) project.externalUrl = externalUrl.trim();
    if (order !== undefined) project.order = parseInt(order, 10);
    project.updatedAt = new Date();

    const updated = await project.save();
    res.json(updated);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Failed to update project in MongoDB.' });
  }
});

// 8. Delete Project from MongoDB (Protected)
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const deleted = await Project.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: `Project with ID '${id}' not found.` });
    }
    res.json({ success: true, message: `Project '${deleted.title}' deleted successfully.` });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project from MongoDB.' });
  }
});

// 9. Reset Projects in MongoDB to Default 12 Designs (Protected)
app.post('/api/projects/reset', requireAuth, async (req, res) => {
  try {
    await Project.deleteMany({});
    await Project.insertMany(DEFAULT_PROJECTS);
    const resetProjects = await Project.find().sort({ order: 1 });
    res.json({ success: true, message: 'Reset all projects to defaults.', projects: resetProjects });
  } catch (err) {
    console.error('Reset projects error:', err);
    res.status(500).json({ error: 'Failed to reset projects in MongoDB.' });
  }
});

/* ── BRANDING WORK API ROUTES ── */

// 10. Get All Branding Works (Public)
app.get('/api/branding', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(DEFAULT_BRANDINGS);
    }
    const brandings = await Branding.find().sort({ order: 1, createdAt: -1 });
    res.json(brandings);
  } catch (err) {
    console.error('Get branding error:', err);
    res.status(500).json({ error: 'Failed to retrieve branding works from database.' });
  }
});

// 11. Create New Branding Work in MongoDB (Protected)
app.post('/api/branding', requireAuth, async (req, res) => {
  try {
    const { id, title, category, img, behanceUrl } = req.body;
    if (!title || !img) {
      return res.status(400).json({ error: 'Title and image are required.' });
    }

    let slug = (id || title).toLowerCase().replace(/[^a-z0-9_\-]+/g, '-');
    const existing = await Branding.findOne({ id: slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const count = await Branding.countDocuments();
    const newBranding = new Branding({
      id: slug,
      title: title.trim(),
      category: category ? category.trim() : 'Brand Identity',
      img: img.trim(),
      behanceUrl: behanceUrl ? behanceUrl.trim() : '',
      order: count + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const saved = await newBranding.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create branding error:', err);
    res.status(500).json({ error: 'Failed to save branding work to MongoDB.' });
  }
});

// 12. Update Branding Work in MongoDB (Protected)
app.put('/api/branding/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, img, behanceUrl, order } = req.body;

    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const item = await Branding.findOne(query);
    if (!item) {
      return res.status(404).json({ error: `Branding work with ID '${id}' not found.` });
    }

    if (title) item.title = title.trim();
    if (category) item.category = category.trim();
    if (img) item.img = img.trim();
    if (behanceUrl !== undefined) item.behanceUrl = behanceUrl.trim();
    if (order !== undefined) item.order = parseInt(order, 10);
    item.updatedAt = new Date();

    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    console.error('Update branding error:', err);
    res.status(500).json({ error: 'Failed to update branding work in MongoDB.' });
  }
});

// 13. Delete Branding Work from MongoDB (Protected)
app.delete('/api/branding/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const deleted = await Branding.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: `Branding work with ID '${id}' not found.` });
    }
    res.json({ success: true, message: `Branding work '${deleted.title}' deleted successfully.` });
  } catch (err) {
    console.error('Delete branding error:', err);
    res.status(500).json({ error: 'Failed to delete branding work from MongoDB.' });
  }
});

/* ── CATCH-ALL ROUTE: SERVE FRONTEND ── */
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ── START SERVER & CONNECT MONGODB (LOCAL RUNTIMES) ── */
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`=======================================================`);
    console.log(`  DJ Freelancer Portfolio & Admin Server`);
    console.log(`  Local URL:   http://localhost:${PORT}`);
    console.log(`  Admin URL:   http://localhost:${PORT}/admin.html`);
    console.log(`=======================================================`);

    await connectToMongo();
  });
}

module.exports = app;

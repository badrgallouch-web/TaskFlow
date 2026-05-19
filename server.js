require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const authRoutes       = require('./routes/auth');
const projectRoutes    = require('./routes/projectRoutes');
const taskRoutes       = require('./routes/taskRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');
const memberRoutes     = require('./routes/memberRoutes');
const activityRoutes   = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use(cors());
app.use(express.json());

// FIX: تقديم ملفات public بشكل صحيح مع السماح بـ index.html
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/TaskFlowDB')
    .then(() => console.log('Connected to MongoDB successfully! ✅'))
    .catch((err) => console.log('MongoDB Connection Error: ❌', err));

// API Routes
app.use('/api/auth',         authRoutes);
app.use('/api/projects',     projectRoutes);
app.use('/api/projects',     memberRoutes);
app.use('/api/tasks',        taskRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/projects/:id/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);

// FIX: Fallback — أي route غير API يرجع index.html (SPA behaviour)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Server is live on port ' + PORT);
});
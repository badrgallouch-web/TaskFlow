require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const memberRoutes = require('./routes/memberRoutes');
const activityRoutes = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TaskFlowDB';
const PORT = process.env.PORT || 3000;

mongoose.set('bufferCommands', false);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use((req, res, next) => {
    if (req.path.startsWith('/api') && mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database unavailable. Start MongoDB with: docker compose up -d'
        });
    }
    next();
});

app.get('/api', (req, res) => {
    res.json({ message: 'TaskFlow API is running...' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', memberRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects/:id/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);

async function start() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully! ✅');

        app.listen(PORT, () => {
            console.log('Server is live on port ' + PORT);
            console.log('Open http://localhost:' + PORT + '/login.html');
        });
    } catch (err) {
        console.error('MongoDB Connection Error: ❌', err.message);
        console.error('Run: docker compose up -d');
        process.exit(1);
    }
}

start();

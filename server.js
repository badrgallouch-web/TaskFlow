require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/memberRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/projects', memberRoutes);
app.use(express.static('public'));

mongoose.connect(
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TaskFlowDB'
)
    .then(() => console.log("Connected to MongoDB successfully! ✅"))
    .catch((err) => console.log("MongoDB Connection Error: ❌", err));

app.get('/', (req, res) => {
    res.send('TaskFlow API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server is live on port " + PORT);
});
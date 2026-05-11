const express = require('express');
const mongoose = require('mongoose');
const app = express();

const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use(express.json());

// العودة للاتصال المحلي كما كان
mongoose.connect('mongodb://127.0.0.1:27017/TaskFlowDB')
    .then(() => console.log("Connected to MongoDB successfully! ✅"))
    .catch((err) => console.log("MongoDB Connection Error: ❌", err));

app.get('/', (req, res) => {
    res.send('TaskFlow API is running...');
});

app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Server is live on port " + PORT);
});
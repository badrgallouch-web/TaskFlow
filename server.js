const express = require('express');
const mongoose = require('mongoose');
const app = express();

const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');

app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TaskFlowDB')
    .then(() => console.log('Connected to MongoDB successfully! ✅'))
    .catch((err) => console.log('MongoDB Connection Error: ❌', err));

app.get('/', (req, res) => {
    res.send('TaskFlow API is running...');
});

app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route activités imbriquée sous projets
app.use('/api/projects/:id/activities', activityRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server is live on port ' + PORT);
});
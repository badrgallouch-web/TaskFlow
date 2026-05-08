const express = require('express');
const mongoose = require('mongoose');

const app = express();

const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/taskflow')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log('MongoDB connection error:', error);
    });

app.get('/', (req, res) => {
    res.send('TaskFlow API is running...');
});

app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Server is live on port " + PORT);
});
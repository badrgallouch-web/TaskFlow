const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'TaskFlow API is running' });
});

// ⬇️ SEULEMENT CETTE LIGNE CHANGE ⬇️
mongoose.connect('mongodb://mongodb:27017/taskflow')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
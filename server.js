const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/tasks', taskRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté ✅'))
  .catch(err => console.log('Erreur MongoDB :', err));

app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow API fonctionne ✅' });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'nom email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT} ✅`);
});
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();


const taskRoutes = require('./routes/tasks');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté ✅'))
  .catch(err => console.log('Erreur MongoDB :', err));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow API fonctionne ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT} ✅`);
});
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  dateLimite: { type: Date },
  statut: { 
    type: String, 
    enum: ['actif', 'en pause', 'archivé'], 
    default: 'actif' 
  },
  createur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
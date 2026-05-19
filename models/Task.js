const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    // دفتر التحملات: basse, moyenne, haute
    priority: {
        type: String,
        enum: ['basse', 'moyenne', 'haute'],
        required: true
    },

    // دفتر التحملات: à faire, en cours, terminé
    status: {
        type: String,
        enum: ['à faire', 'en cours', 'terminé'],
        required: true
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    dueDate: {
        type: Date
    }

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },

    status: {
        type: String,
        enum: ['todo', 'doing', 'done'],
        required: true
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

});

module.exports = mongoose.model('Task', taskSchema);
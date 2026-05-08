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
        type: String,
        required: true
    }

});

module.exports = mongoose.model('Task', taskSchema);
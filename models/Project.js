const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({

    projectName: {
        type: String,
        required: true
    },

    description: String,

    startDate: {
        type: Date,
        default: Date.now
    },

    endDate: Date,

    status: {
        type: String,
        enum: ['planned', 'ongoing', 'done'],
        default: 'planned'
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

});

module.exports = mongoose.model('Project', projectSchema);
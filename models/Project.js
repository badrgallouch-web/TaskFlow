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
    }
});

module.exports = mongoose.model('Project', projectSchema);
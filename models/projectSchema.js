const projectSchema = {
    projectName: String,
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
        type: String,
        enum: ['planned', 'ongoing', 'done'],
        default: 'planned'
    }
};

module.exports = projectSchema;
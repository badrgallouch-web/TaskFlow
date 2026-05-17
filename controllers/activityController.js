const Activity = require('../models/Activity');
const Project = require('../models/Project');

// GET /api/projects/:id/activities
exports.getProjectActivities = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const activities = await Activity.find({ projectId: req.params.id })
            .sort({ createdAt: -1 }); // plus récente → plus ancienne

        res.status(200).json({
            message: 'Activity feed retrieved successfully',
            count: activities.length,
            data: activities
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activities', error: error.message });
    }
};
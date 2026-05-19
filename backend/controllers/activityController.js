const Activity = require('../models/Activity');
const Project = require('../models/Project');
const { formatActivityMessage } = require('../utils/activityMessages');

// GET /api/projects/:id/activities
exports.getProjectActivities = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some((m) => m.toString() === req.user.id);
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    const data = activities.map((activity) => ({
      _id: activity._id,
      type: activity.type,
      project: activity.project,
      user: activity.user,
      meta: activity.meta,
      createdAt: activity.createdAt,
      message: formatActivityMessage(activity),
    }));

    res.status(200).json({
      message: 'Activity feed retrieved successfully',
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
};

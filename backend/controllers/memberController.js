const Project = require('../models/Project');
const User = require('../models/User');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationLogger');

exports.inviteMember = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { email } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Only the project owner can invite members',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User with this email does not exist',
      });
    }

    if (project.members.some((m) => m.toString() === user._id.toString())) {
      return res.status(400).json({
        message: 'User is already a member',
      });
    }

    project.members.push(user._id);
    await project.save();

    await logActivity({
      actionType: 'member_added',
      projectId: project._id,
      userId: req.user.id,
      description: `${user.fullName} a été ajouté au projet`,
      metadata: {
        memberId: user._id,
        memberName: user.fullName,
        memberEmail: user.email,
      },
    });

    await createNotification({
      userId: user._id,
      type: 'member_added',
      message: `Vous avez été ajouté au projet « ${project.projectName} »`,
      projectId: project._id,
    });

    res.status(200).json({
      message: 'Member added successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Only owner can remove members',
      });
    }

    const removedUser = await User.findById(req.params.userId);

    project.members = project.members.filter(
      (memberId) => memberId.toString() !== req.params.userId
    );

    await project.save();

    await logActivity({
      actionType: 'member_removed',
      projectId: project._id,
      userId: req.user.id,
      description: `${removedUser?.fullName || 'Un membre'} a été retiré du projet`,
      metadata: {
        memberId: req.params.userId,
        memberName: removedUser?.fullName,
        memberEmail: removedUser?.email,
      },
    });

    res.status(200).json({
      message: 'Member removed successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

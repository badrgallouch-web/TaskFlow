const Project = require('../models/Project');
const User = require('../models/User');

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
                message: 'Only the project owner can invite members'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'User with this email does not exist'
            });
        }

        if (project.members.includes(user._id)) {
            return res.status(400).json({
                message: 'User is already a member'
            });
        }

        project.members.push(user._id);
        await project.save();

        res.status(200).json({
            message: 'Member added successfully',
            project
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
                message: 'Project not found'
            });

        }

        if (project.owner.toString() !== req.user.id) {

            return res.status(403).json({
                message: 'Only owner can remove members'
            });

        }

        project.members = project.members.filter(

            memberId => memberId.toString() !== req.params.userId

        );

        await project.save();

        res.status(200).json({
            message: 'Member removed successfully',
            project
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
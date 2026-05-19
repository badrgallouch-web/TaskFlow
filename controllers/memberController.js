const Project = require('../models/Project');
const User = require('../models/User');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationLogger');

exports.inviteMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Seul le propriétaire peut inviter des membres'
            });
        }

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: 'Aucun utilisateur trouvé avec cet email'
            });
        }

        // FIX: الرسالة كانت بالإنجليزية — الآن بالفرنسية
        if (project.members.includes(user._id)) {
            return res.status(400).json({
                message: 'Cet utilisateur est déjà membre du projet'
            });
        }

        project.members.push(user._id);
        await project.save();

        await logActivity({
            actionType: 'member_added',
            projectId: project._id,
            userId: req.user.id,
            description: `${user.fullName} a été ajouté au projet`
        });

        await createNotification({
            userId: user._id.toString(),
            type: 'member_added',
            message: `Vous avez été ajouté au projet "${project.projectName}"`,
            projectId: project._id
        });

        res.status(200).json({
            message: 'Membre ajouté avec succès',
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
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Seul le propriétaire peut retirer des membres'
            });
        }

        const memberIdToRemove = req.params.userId;
        const removedUser = await User.findById(memberIdToRemove);

        project.members = project.members.filter(
            memberId => memberId.toString() !== memberIdToRemove
        );

        await project.save();

        await logActivity({
            actionType: 'member_removed',
            projectId: project._id,
            userId: req.user.id,
            description: `${removedUser?.fullName || 'Un membre'} a été retiré du projet`
        });

        res.status(200).json({
            message: 'Membre retiré avec succès',
            project
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

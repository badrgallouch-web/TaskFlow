const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
    try {
        // التأكد من تحويل المعرف إلى ObjectId صالح لـ MongoDB
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const now = new Date();

        // 1. حساب المشاريع النشطة باستخدام Aggregation ($match, $count) - توافق تام مع دفتر التحملات
        const projectStats = await Project.aggregate([
            {
                $match: {
                    $or: [{ owner: userId }, { members: userId }],
                    status: 'actif'
                }
            },
            {
                $count: 'activeProjects'
            }
        ]);

        const activeProjects = projectStats.length > 0 ? projectStats[0].activeProjects : 0;

        // 2. حساب المهام (المسندة، المنجزة، المتأخرة) باستخدام Aggregation ($match, $group)
        const taskStats = await Task.aggregate([
            {
                $match: { assignedTo: userId }
            },
            {
                $group: {
                    _id: null,
                    assignedTasks: { $sum: 1 }, // حساب كل المهام التي مرت من الفلتر
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ["$status", "terminé"] }, 1, 0] }
                    },
                    lateTasks: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$status", "terminé"] },
                                        // انتبه: إذا كان حقل التاريخ في Task.js اسمه deadline، قم بتغيير dueDate هنا إلى deadline
                                        { $lt: ["$dueDate", now] },
                                        { $ne: ["$dueDate", null] } 
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        // استخراج النتائج أو إرجاع أصفار إذا لم تكن هناك مهام
        const stats = taskStats.length > 0 ? taskStats[0] : { assignedTasks: 0, completedTasks: 0, lateTasks: 0 };

        res.status(200).json({
            activeProjects,
            assignedTasks: stats.assignedTasks,
            completedTasks: stats.completedTasks,
            lateTasks: stats.lateTasks
        });

    } catch (error) {
        console.error("Erreur Dashboard Aggregation:", error);
        res.status(500).json({ message: 'Erreur dashboard', error: error.message });
    }
};
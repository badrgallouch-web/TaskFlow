const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboardStats = async (req, res) => {
    try {
        
        const totalProjects = await Project.countDocuments();

        
        const tasksByStatus = await Task.aggregate([
            {
                $group: {
                    _id: "$status", 
                    count: { $sum: 1 } 
                }
            }
        ]);

       
        res.status(200).json({
            message: "Dashboard statistics retrieved successfully",
            data: {
                totalProjects,
                tasksByStatus
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
    }
};
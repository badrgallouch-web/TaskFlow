const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. استخراج المعرف بشكل آمن
        const userId = req.user.id || req.user._id || req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: 'Utilisateur non identifié' });
        }

        // 2. حساب المشاريع النشطة باستخدام countDocuments (التي تدعم الـ Auto-casting)
        const activeProjects = await Project.countDocuments({
            $or: [{ owner: userId }, { members: userId }],
            status: 'actif'
        });

        // 3. جلب جميع مهام المستخدم (بنفس الطريقة التي نجحت في الجدول السفلي)
        const userTasks = await Task.find({ assignedTo: userId });

        // 4. بناء العدادات يدوياً بناءً على البيانات المستخرجة لضمان الدقة المطلقة
        let assignedTasks = userTasks.length;
        let completedTasks = 0;
        let lateTasks = 0;
        const now = new Date();

        userTasks.forEach(task => {
            // حساب المهام المنجزة (تجاهل حالة الأحرف)
            if (task.status && task.status.toLowerCase() === 'terminé') {
                completedTasks++;
            } 
            // حساب المهام المتأخرة
            else {
                if (task.dueDate && new Date(task.dueDate) < now) {
                    lateTasks++;
                }
            }
        });

        // 5. إرسال الأرقام النهائية للواجهة
        res.status(200).json({
            activeProjects,
            assignedTasks,
            completedTasks,
            lateTasks
        });

    } catch (error) {
        console.error("Erreur Dashboard:", error);
        res.status(500).json({ message: 'Erreur dashboard', error: error.message });
    }
};
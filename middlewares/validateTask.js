const allowedPriorities = ['low', 'medium', 'high'];
const allowedStatuses = ['todo', 'doing', 'done'];

exports.validateTask = (req, res, next) => {
    const { title, priority, status, projectId } = req.body;

    if (!title || !priority || !status || !projectId) {
        return res.status(400).json({
            message: 'title, priority, status and projectId are required'
        });
    }

    if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
            message: 'priority must be low, medium or high'
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: 'status must be todo, doing or done'
        });
    }

    next();
};

exports.validateStatus = (req, res, next) => {
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: 'status must be todo, doing or done'
        });
    }

    next();
};
// القيم يجب أن تطابق Task.js تماماً
const allowedPriorities = ['basse', 'moyenne', 'haute'];
const allowedStatuses   = ['à faire', 'en cours', 'terminé'];

exports.validateTask = (req, res, next) => {
    const { title, priority, status, projectId } = req.body;

    if (!title || !priority || !status || !projectId) {
        return res.status(400).json({
            message: 'title, priority, status et projectId sont obligatoires'
        });
    }

    if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
            message: 'priority doit être : basse, moyenne ou haute'
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: 'status doit être : à faire, en cours ou terminé'
        });
    }

    next();
};

exports.validateStatus = (req, res, next) => {
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: 'status doit être : à faire, en cours ou terminé'
        });
    }

    next();
};

const mongoose = require('mongoose');
const Task = require('./Task');

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true
    },
    description: String,
    startDate: {
        type: Date,
        default: Date.now
    },
    // FIX: إضافة تحقق (Validator) يمنع التواريخ الماضية
    endDate: {
        type: Date,
        validate: {
            validator: function(value) {
                // إذا لم يتم إدخال تاريخ (لأنه اختياري)، نسمح بمروره
                if (!value) return true; 
                
                // تصفير ساعات اليوم الحالي لمقارنة الأيام فقط بدقة
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value >= today;
            },
            message: 'La date limite ne peut pas être dans le passé.'
        }
    },
    status: {
        type: String,
        enum: ['actif', 'en pause', 'archivé'],
        default: 'actif'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

// الحذف المتسلسل (Cascade delete)
projectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    await Task.deleteMany({ projectId: this._id });
    next();
});

module.exports = mongoose.model('Project', projectSchema);
const mongoose = require('mongoose');

// Notification schema for budget alerts and goal milestones
const notificationSchema = new mongoose.Schema(
  {
        user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
        },
        type: {
                type: String,
                enum: ['budget_alert', 'goal_milestone', 'recurring_reminder', 'general'],
                required: true,
        },
        title: {
                type: String,
                required: true,
                trim: true,
        },
        message: {
                type: String,
                required: true,
        },
        read: {
                type: Boolean,
          default: false,
        },
        relatedId: {
                // Optional: link to a budget, goal, or transaction
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
  },
  { timestamps: true }
  );

// Mark all notifications as read for a user
notificationSchema.statics.markAllRead = async function (userId) {
    return this.updateMany({ user: userId, read: false }, { read: true });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

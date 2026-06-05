const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
        user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
        },
        name: {
                type: String,
                required: true,
                trim: true,
        },
        targetAmount: {
                type: Number,
                required: true,
                min: 0,
        },
        savedAmount: {
                type: Number,
          default: 0,
                min: 0,
        },
        deadline: {
                type: Date,
          default: null,
        },
        isCompleted: {
                type: Boolean,
          default: false,
        },
  },
  { timestamps: true }
  );

module.exports = mongoose.model('Goal', goalSchema);

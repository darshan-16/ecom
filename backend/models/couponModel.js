import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    category: { type: String, required: true},
    value: { type: Number, default: 0, required: true },
    purchaceAbove: { type: Number, default: 0, required: true },
    remainingUsage: { type: Number, default: 0, required: true },
    usersUsed:{ type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('coupon', userSchema);
export default User;

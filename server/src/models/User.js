import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'project_manager', 'team_member', 'viewer'],
      default: 'viewer'
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

export default mongoose.model('User', userSchema);

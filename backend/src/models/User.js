import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student', index: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    semester: { type: Number, min: 1, max: 12 }
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export default mongoose.model('User', UserSchema);



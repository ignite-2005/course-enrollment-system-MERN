import mongoose from 'mongoose';

const ProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    semesters: { type: Number, required: true, min: 1, max: 12 },
    degree: { type: String, enum: ['BTech', 'MTech', 'MS', 'PhD', 'Other'], default: 'BTech' }
  },
  { timestamps: true }
);

export default mongoose.model('Program', ProgramSchema);



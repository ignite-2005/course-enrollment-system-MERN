import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, index: true },
    title: { type: String, required: true, trim: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 12, index: true },
    capacity: { type: Number, default: 60, min: 1 },
    credits: { type: Number, default: 3, min: 0 },
    description: { type: String, default: '' },
    timeslots: [{ type: String }],
    prerequisites: [{ type: String }],
    courseType: { type: String, enum: ['FC', 'CC', 'EC', 'LAB', 'UC'], required: true, index: true },
    status: { type: String, enum: ['Available', 'Enrolled', 'Completed'], default: 'Available' },
    hasLab: { type: Boolean, default: false },
    isElective: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

CourseSchema.index({ program: 1, semester: 1, code: 1 }, { unique: true });

export default mongoose.model('Course', CourseSchema);



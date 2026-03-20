import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  dueDate: { type: Date, required: true },
  fileText: { type: String, default: "" },
  additionalInfo: { type: String, default: "" },
  questionTypes: [
    {
      id: String,
      type: { type: String },
      count: Number,
      marks: Number
    }
  ],
  jobStatus: { type: String, enum: ['queued', 'processing', 'done', 'error'], default: 'queued' },
  generatedPaper: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

export default mongoose.model('Assignment', AssignmentSchema);

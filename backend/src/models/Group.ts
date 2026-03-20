import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, default: '🎓' },
  color: { type: String, default: '#1a1a2e' },
  membersCount: { type: Number, default: 0 },
  assignmentsCount: { type: Number, default: 0 },
  members: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Group || mongoose.model('Group', GroupSchema);

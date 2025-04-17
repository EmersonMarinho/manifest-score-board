import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  kills: { type: Number, required: true, default: 0 },
  deaths: { type: Number, required: true, default: 0 },
  debuffs: { type: Number, required: true, default: 0 },
  damage: { type: Number, required: true, default: 0 },
  damageTaken: { type: Number, required: true, default: 0 },
  healing: { type: Number, required: true, default: 0 }
}, { _id: false });

const matchSchema = new mongoose.Schema({
  date: { type: String, required: true },
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  result: { type: String, required: true, enum: ['Victory', 'Defeat'] },
  team1Score: { type: Number, required: true },
  team2Score: { type: Number, required: true },
  team1Players: [playerStatsSchema],
  team2Players: [playerStatsSchema]
}, {
  timestamps: true,
  versionKey: false
});

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

export default Match; 
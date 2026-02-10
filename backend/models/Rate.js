import mongoose from 'mongoose';

const rateSchema = new mongoose.Schema({
    gameType: { type: String, required: true, unique: true },
    rate: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Rate', rateSchema);

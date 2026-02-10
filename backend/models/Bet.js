import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    marketId: { type: String, required: true },
    marketName: { type: String, default: '' },
    betType: { type: String, required: true },
    betNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    betOn: { type: String, default: 'open' },
    scheduledDate: { type: String, default: null },
    status: { type: String, default: 'pending' },
    winAmount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Bet', betSchema);
